import { openai } from '@/lib/openai';
import { fetchModel } from '@/utils/ai/fetchModel';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { CircuitBreaker, RetryHandler, ErrorClassifier } from '@/utils/circuitBreaker';
import { PermissionService } from './safety/permissionService';
import { PromptSandbox } from './safety/promptSandbox';
import { auditLogger } from './audit/auditLogger';
import { AgentUpdateService } from './agentUpdateService';
import { AgentBuilderError } from './agentBuilderService';
import { checkAgentTokenLimit, updateAgentUsage, countAgentTokens } from '@/utils/ai/agentUsageTracking';
import { TokenBudgetManager } from './optimization/tokenBudgetManager';
import { agentBuilderContextService } from './agentBuilderContextService';
import { AI_OPERATOR_FLOW_GUIDE } from './aiOperatorFlowGuide';
import { EntityScopeInferrer } from './context/entityScopeInferrer';
import {
  agentBuilderStateService,
  ConversationState,
  AgentDraft,
  ConversationStage,
} from './agentBuilderStateService';

const OperatorResponseSchema = z.object({
  response: z.string(),
  suggestedActions: z
    .array(
      z.object({
        type: z.enum(['execute', 'update', 'info']),
        label: z.string().max(120),
        payload: z.any().optional(),
      })
    )
    .default([]),
  patch: z.record(z.any()).optional(),
});

const OperatorWelcomeResponseSchema = z.object({
  welcomeMessage: z.string(),
});

export class AgentOperatorService {
  private readonly circuitBreaker = new CircuitBreaker({ failureThreshold: 5, resetTimeout: 60000, halfOpenMaxCalls: 3 });
  private readonly retryHandler = new RetryHandler();
  private readonly errorClassifier = new ErrorClassifier();
  private readonly permissionService = new PermissionService();
  private readonly promptSandbox = new PromptSandbox();
  private readonly tokenBudgetManager = new TokenBudgetManager();
  private readonly agentUpdateService = new AgentUpdateService();
  private readonly entityScopeInferrer = new EntityScopeInferrer();

  private async runCompletion(request: any, context: { operation: string; agentId: string; userId: string }) {
    try {
      return await this.retryHandler.retry(
        () => this.circuitBreaker.execute(() => openai.chat.completions.create(request)),
        { maxAttempts: 3, baseDelay: 800 }
      );
    } catch (error) {
      const classification = this.errorClassifier.classify(error as Error);
      const errorId = randomUUID();
      console.error('[AgentOperator] LLM failed', { errorId, context, classification, error });
      throw new AgentBuilderError(
        'AGENT_OPERATOR_COMPLETION_FAILED',
        `LLM call failed: ${classification.type}`,
        'I could not process that request. Please try again shortly.',
        { errorId, classification }
      );
    }
  }

    async initializeConversation(
    userId: string,
    conversationId?: string,
    agentId?: string,
    skipWelcome?: boolean
  ): Promise<{
    conversationId: string;
    conversationState: ConversationState;
    userContext: UserContext;
    welcomeMessage: string;
    quickActions: QuickAction[];
    followups?: Array<{ id: string; label: string }>;
  }> {
    // Fetch user context
 const agent = await this.assertAgentAccess(agentId, userId);
    let userContext = await agentBuilderContextService.fetchUserContext(userId);

    try {
      userContext = await this.entityScopeInferrer.inferAndFetchEntityScope(
        message,
        agent.systemPrompt
          ? [{ role: 'system', content: agent.systemPrompt }]
          : [],
        userContext,
        userId
      );
    } catch (error) {
      console.error('[AgentOperator] Failed to infer entity scope for operator chat:', error);
    }
    // If conversationId is provided, load existing state
    let conversationState: ConversationState;
    if (conversationId) {
      // Acquire lock to prevent concurrent initialization
      const lockKey = `${this.LOCK_KEY_PREFIX}init:${conversationId}`;
      const lockAcquired = await this.acquireLock(lockKey);
      if (!lockAcquired) {
        // If lock not acquired, wait a bit and retry once
        await new Promise(resolve => setTimeout(resolve, 100));
        const retryLock = await this.acquireLock(lockKey);
        if (!retryLock) {
          // Still locked, just load and return existing state
          console.log(`[AgentBuilder] Conversation ${conversationId} is being initialized, loading existing state`);
        }
      }

      try {
        console.log(`[AgentBuilder] Loading existing conversation: ${conversationId}`);
        const existingState = await agentBuilderStateService.getConversationState(conversationId);
        if (!existingState) {
          throw new AgentBuilderError(
            'AGENT_OPERATOR_CONVERSATION_NOT_FOUND',
            `Conversation ${conversationId} not found`,
            'This conversation could not be found. Please start a new conversation.',
            { conversationId, userId }
          );
        }
        if (existingState.userId !== userId) {
          throw new AgentBuilderError(
            'AGENT_OPERATOR_UNAUTHORIZED',
            `Unauthorized: Conversation ${conversationId} does not belong to user ${userId}`,
            'You do not have access to this conversation.',
            { conversationId, userId }
          );
        }

        conversationState = existingState;

        // Check if conversation has any messages
        const messageCount = await prisma.aiMessage.count({
          where: { conversationId },
        });

        const hasMessages = messageCount > 0;

        if (!hasMessages && !skipWelcome) {  // Only add welcome if not skipping
          console.log(`[AgentBuilder] Conversation ${conversationId} is empty, generating welcome message`);

          // Generate welcome message for empty existing conversation
          const { welcomeMessage, followups } = await this.generateWelcomeMessage(userContext, userId);

          // Add welcome message to history with follow-ups in metadata
          await agentBuilderStateService.addMessageToHistory(
            conversationState.conversationId,
            'assistant',
            welcomeMessage,
          );

          // Refresh conversation state to get updated history with welcome message
          const refreshedState = await agentBuilderStateService.getConversationState(conversationId);
          if (!refreshedState) {
            throw new AgentBuilderError(
              'AGENT_OPERATOR_STATE_REFRESH_FAILED',
              `Failed to refresh conversation state for ${conversationId}`,
              'Failed to load conversation state. Please try again.',
              { conversationId, userId }
            );
          }

          return {
            conversationId: refreshedState.conversationId,
            conversationState: refreshedState,
            userContext,
            welcomeMessage,
            quickActions: [],
            followups: [],
          };
        }

        // Conversation has messages - load existing conversation without new welcome
        console.log(`[AgentBuilder] Successfully loaded existing conversation: ${conversationId}, stage: ${conversationState.stage}, messages: ${conversationState.conversationHistory.length}`);
        return {
          conversationId: conversationState.conversationId,
          conversationState,
          userContext,
          welcomeMessage: '', // No welcome message for non-empty conversation
          quickActions: [],
          followups: [],
        };
      } finally {
        // Always release lock
        if (lockAcquired) {
          await this.releaseLock(lockKey);
        }
      }
    }

    // If agentId provided but no conversationId, check if agent has conversations
    if (agentId && !conversationId) {
      const agent = await prisma.aiAgent.findUnique({
        where: { id: agentId },
        include: { conversations: { where: { conversationType: 'AGENT_OPERATOR' }, orderBy: { createdAt: 'desc' }, take: 1 } },
      });

      if (agent?.conversations?.[0]) {
        // Agent has existing conversation - recursively call with conversationId
        console.log(`[AgentBuilder] Agent ${agentId} has existing conversation ${agent.conversations[0].id}, loading it`);
        return this.initializeConversation(userId, agent.conversations[0].id);
      }
    }

    // Create new conversation state
    console.log(`[AgentBuilder] Creating new conversation${agentId ? ` for agent ${agentId}` : ''}`);
    conversationState = await agentBuilderStateService.createConversationState(
      userId,
      agentId
    );

    // Acquire lock for new conversation to prevent duplicate welcome messages
    const newLockKey = `${this.LOCK_KEY_PREFIX}init:${conversationState.conversationId}`;
    const newLockAcquired = await this.acquireLock(newLockKey);

    try {
      // Double-check: verify no messages were added while we were creating the conversation
      const messageCount = await prisma.aiMessage.count({
        where: { conversationId: conversationState.conversationId },
      });

      if (messageCount > 0) {
        // Messages already exist, refresh state and return
        console.log(`[AgentBuilder] Messages already exist for new conversation ${conversationState.conversationId}`);
        const refreshedState = await agentBuilderStateService.getConversationState(conversationState.conversationId);
        if (!refreshedState) {
          throw new AgentBuilderError(
            'AGENT_OPERATOR_STATE_REFRESH_FAILED',
            `Failed to refresh conversation state for ${conversationState.conversationId}`,
            'Failed to load conversation state. Please try again.',
            { conversationId: conversationState.conversationId, userId }
          );
        }
        return {
          conversationId: refreshedState.conversationId,
          conversationState: refreshedState,
          userContext,
          welcomeMessage: '',
          quickActions: [],
          followups: [],
        };
      }

      if (!skipWelcome) {
        const { welcomeMessag } = await this.generateWelcomeMessage(userContext, userId);

        await agentBuilderStateService.addMessageToHistory(
          conversationState.conversationId,
          'assistant',
          welcomeMessage,
          followups
        );

        const refreshedState = await agentBuilderStateService.getConversationState(conversationState.conversationId);
        if (!refreshedState) {
          throw new AgentBuilderError(
            'AGENT_OPERATOR_STATE_REFRESH_FAILED',
            `Failed to refresh conversation state for ${conversationState.conversationId}`,
            'Failed to load conversation state. Please try again.',
            { conversationId: conversationState.conversationId, userId }
          );
        }

        return {
          conversationId: refreshedState.conversationId,
          conversationState: refreshedState,
          userContext,
          welcomeMessage,
          quickActions: [],
          followups,
        };
      } else {
        // Skip welcome - return empty conversation state
        return {
          conversationId: conversationState.conversationId,
          conversationState,
          userContext,
          welcomeMessage: '',
          quickActions: [],
          followups: [],
        };
      }
    } finally {
      if (newLockAcquired) {
        await this.releaseLock(newLockKey);
      }
    }
  }


   // **NEW: Extract welcome message generation to separate method**
  private async generateWelcomeMessage(
    userContext: UserContext,
    userId: string
  ): Promise<{ welcomeMessage: string; followups: Array<{ id: string; label: string }> }> {

        const agent = await this.assertAgentAccess(agentId, userId);
    
    // Estimate tokens before API call
    const messages = [
          {
            role: 'system' as const,
            content: `You are the Xovira Agent Operator assistant.
    
    === AI OPERATOR FLOW GUIDE (REFERENCE) ===
    ${AI_OPERATOR_FLOW_GUIDE}
    === END OF FLOW GUIDE ===
    
    Generate a short, friendly welcome message for the operator panel for this agent.
    
    Requirements:
    - Mention the agent by name.
    - Follow the pattern: "Have questions or want to know how to work with [AGENT NAME]? Ask me!"
    - Make it clear the user can ask questions about how the agent works, how to change it, and how to run it.
    - Optionally reference what the agent does based on its configuration, tools, triggers, and recent executions.
    - Keep it to 1-3 sentences, conversational and direct.
    
    Return strictly JSON with shape: { "welcomeMessage": string }.`,
          },
          {
            role: 'user' as const,
            content: JSON.stringify({
              agent: {
                id: agent.id,
                name: agent.name,
                type: agent.agentType,
                status: agent.status,
                isActive: agent.isActive,
                description: agent.description,
                capabilities: agent.capabilities,
                constraints: agent.constraints,
                systemPrompt: agent.systemPrompt,
                tools: agent.tools,
                triggers: agent.triggers,
              },
              userContext,
            }),
          },
        ];
    

    // Fetch model
    const model = await fetchModel();

    const estimatedTokens = estimateTokens(JSON.stringify(messages)) + 500; // Add buffer for response

    // Check token limit
    const tokenCheck = await checkAgentTokenLimit(userId, estimatedTokens);
    if (!tokenCheck.allowed) {
      throw new AgentBuilderError(
        'AGENT_OPERATOR_INSUFFICIENT_TOKENS',
        `Insufficient tokens: ${tokenCheck.remaining} remaining, need ${estimatedTokens}`,
        `You have ${tokenCheck.remaining} tokens remaining, but need approximately ${estimatedTokens} tokens. Please upgrade your plan or purchase more tokens.`,
        { userId, remaining: tokenCheck.remaining, required: estimatedTokens }
      );
    }

  const completion = await this.runCompletion(
      {
        model: model.name,
        messages,
        temperature: 0.3,
        max_tokens: 300,
      },
      { operation: 'operator_initialize', agentId, userId }
    );

    const content = completion.choices?.[0]?.message?.content;
        if (!content) {
          throw new AgentBuilderError(
            'AGENT_OPERATOR_WELCOME_FAILED',
            'Failed to generate operator welcome message',
            'I could not prepare the operator view. Please try again.',
            { agentId, userId }
          );
        }
    
        let parsed;
        try {
          parsed = OperatorWelcomeResponseSchema.safeParse(JSON.parse(content));
        } catch (error) {
          throw new AgentBuilderError(
            'AGENT_OPERATOR_WELCOME_PARSE_FAILED',
            'Failed to parse operator welcome response',
            'I could not prepare the operator view. Please try again.',
            { agentId, userId, error: error instanceof Error ? error.message : String(error) }
          );
        }
    
        if (!parsed.success) {
          throw new AgentBuilderError(
            'AGENT_OPERATOR_WELCOME_INVALID',
            'Operator welcome response did not match schema',
            'I could not prepare the operator view. Please try again.',
            { agentId, userId, issues: parsed.error.issues }
          );
        }
    
        countAgentTokens(
          messages as Array<{ role: string; content: string }>,
          content,
          model.name
        ).then(async (tokenCount) => {
          try {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { name: true, email: true },
            });
            await updateAgentUsage(
              userId,
              user?.name || user?.email || 'User',
              tokenCount.inputTokens,
              tokenCount.outputTokens,
              user?.email || undefined
            );
          } catch (error) {
            console.error('Failed to update agent usage for operator initialization:', error);
          }
        }).catch(() => {});
    
    const result = parsed.data.welcomeMessage;

    return result;
  }


   /**
     * Acquire a lock for a conversation to prevent concurrent processing
     */
    private async acquireLock(conversationId: string): Promise<boolean> {
      const lockKey = `${this.LOCK_KEY_PREFIX}${conversationId}`;
      try {
        const result = await redis.set(lockKey, '1', 'EX', this.LOCK_TIMEOUT, 'NX');
        return result === 'OK';
      } catch (error) {
        console.error(`[AgentBuilder] Failed to acquire lock for ${conversationId}:`, error);
        // If Redis fails, allow processing (fail open)
        return true;
      }
    }
  
    /**
     * Release a lock for a conversation
     */
    private async releaseLock(conversationId: string): Promise<void> {
      const lockKey = `${this.LOCK_KEY_PREFIX}${conversationId}`;
      try {
        await redis.del(lockKey);
      } catch (error) {
        console.error(`[AgentBuilder] Failed to release lock for ${conversationId}:`, error);
        // Don't throw - lock will expire anyway
      }
    }
  
  /**
   * Conversational operator entry point: answer questions, propose actions/patches.
   */
  async operatorChat(
    agentId: string,
    userId: string,
    message: string,
    context?: { workspaceId?: string; conversationId?: string }
  ): Promise<{ response: string; suggestedActions: any[]; patch?: Record<string, any> }> {
    const agent = await this.assertAgentAccess(agentId, userId);
    let userContext = await agentBuilderContextService.fetchUserContext(userId);

    try {
      userContext = await this.entityScopeInferrer.inferAndFetchEntityScope(
        message,
        agent.systemPrompt
          ? [{ role: 'system', content: agent.systemPrompt }]
          : [],
        userContext,
        userId
      );
    } catch (error) {
      console.error('[AgentOperator] Failed to infer entity scope for operator chat:', error);
    }

    const recentExecutions = await prisma.agentExecution.findMany({
      where: { agentId },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    const executionsSummary = recentExecutions.map((exec) => ({
      id: exec.id,
      status: exec.status,
      startedAt: exec.startedAt,
      completedAt: exec.completedAt,
      trigger: exec.triggeredBy,
    }));

    const activeTools = (agent.tools || []).filter((tool: any) => tool.isActive);
    const toolsSummary = activeTools.map((tool: any) => ({
      id: tool.id,
      name: tool.name,
      type: tool.toolType,
      description: tool.description,
      isActive: tool.isActive,
      tags: tool.tags,
    }));

    const activeTriggers = (agent.triggers || []).filter((trigger: any) => trigger.isActive);
    const triggersSummary = activeTriggers.map((trigger: any) => ({
      id: trigger.id,
      type: trigger.triggerType,
      name: trigger.name,
      description: trigger.description,
      priority: trigger.priority,
      tags: trigger.tags,
    }));

    const model = await fetchModel();
    const guardrails = `QUALITY
- Be concise, factual, and accurate to this agent's stored configuration.
- Never invent tools, triggers, or capabilities that the agent does not have.
- When suggesting updates, provide a minimal JSON patch (partial object) under patch.
- When suggesting an execution, include a suggested input payload under payload.
- Keep at most 3 suggestedActions; labels < 80 chars.`;

    const systemPrompt = `You are an Agent Operator assistant for Xovira.
You can: (1) answer questions about the agent, (2) infer and propose safe configuration updates as a minimal JSON patch, (3) suggest running the agent with an input.
Use the agent data, workspace context, and recent executions exactly as given. When inferring configuration, keep changes minimal and aligned with the existing intent of the agent.
For executions, suggest clear input payloads that this agent can handle based on its tools and triggers.
Output must be JSON via the function.
${guardrails}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: JSON.stringify({
          message,
          agent: {
            id: agent.id,
            name: agent.name,
            type: agent.agentType,
            status: agent.status,
            isActive: agent.isActive,
            description: agent.description,
            capabilities: agent.capabilities,
            constraints: agent.constraints,
            systemPrompt: agent.systemPrompt,
            modelConfig: {
              modelId: agent.modelId,
              temperature: agent.temperature,
              maxTokens: agent.maxTokens,
            },
            tools: agent.availableTools,
            toolsSummary,
            triggers: triggersSummary,
            stats: {
              totalExecutions: agent.totalExecutions,
              successfulRuns: agent.successfulRuns,
              failedRuns: agent.failedRuns,
              lastExecutedAt: agent.lastExecutedAt,
            },
          },
          userContext,
          executions: executionsSummary,
          context,
        }),
      },
    ];

    const estimatedTokens = this.tokenBudgetManager.estimateTokens(JSON.stringify(messages)) + 800;
    const tokenCheck = await checkAgentTokenLimit(userId, estimatedTokens);
    if (!tokenCheck.allowed) {
      throw new AgentBuilderError(
        'AGENT_OPERATOR_TOKEN_LIMIT',
        'Token limit exceeded for operator chat',
        'You are over the current token budget. Please wait or upgrade your plan.',
        { remaining: tokenCheck.remaining, estimatedTokens }
      );
    }

    const completion = await this.runCompletion(
      {
        model: model.name,
        messages,
        temperature: 0.4,
        max_tokens: 800,
        tools: [
          {
            type: 'function',
            function: {
              name: 'operator_response',
              description: 'Respond to the user with actions and optional patch',
              parameters: {
                type: 'object',
                properties: {
                  response: { type: 'string' },
                  suggestedActions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', enum: ['execute', 'update', 'info'] },
                        label: { type: 'string' },
                        payload: { type: 'object' },
                      },
                      required: ['type', 'label'],
                    },
                  },
                  patch: { type: 'object' },
                },
                required: ['response'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'operator_response' } },
      },
      { operation: 'operator_chat', agentId, userId }
    );

    const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'operator_response') {
      throw new AgentBuilderError(
        'AGENT_OPERATOR_NO_RESPONSE',
        'Operator did not return a structured response',
        'I was unable to craft an answer. Please try again.',
        { agentId, userId }
      );
    }

    countAgentTokens(
      messages as Array<{ role: string; content: string }>,
      toolCall.function.arguments,
      model.name
    ).then(async (tokenCount) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        });
        await updateAgentUsage(
          userId,
          user?.name || user?.email || 'User',
          tokenCount.inputTokens,
          tokenCount.outputTokens,
          user?.email || undefined
        );
      } catch (error) {
        console.error('Failed to update agent usage for operator chat:', error);
      }
    }).catch(() => {});

    const parsed = OperatorResponseSchema.safeParse(JSON.parse(toolCall.function.arguments));
    if (!parsed.success) {
      throw new AgentBuilderError(
        'AGENT_OPERATOR_PARSE_FAILED',
        'Failed to parse operator response',
        'I could not parse the result. Please try again.',
        { issues: parsed.error.issues }
      );
    }

    const sandboxed = await this.promptSandbox.validatePrompt(parsed.data.response);
    if (!sandboxed.valid) {
      throw new AgentBuilderError(
        'AGENT_OPERATOR_SAFETY',
        'Response failed safety validation',
        'The generated response did not pass safety checks.',
        { violations: sandboxed.errors }
      );
    }

    return {
      response: sandboxed.sanitized || parsed.data.response,
      suggestedActions: parsed.data.suggestedActions.slice(0, 3),
      patch: parsed.data.patch,
    };
  }

  /** Apply a patch suggested by operator */
  async applySuggestedChanges(agentId: string, userId: string, patch: Record<string, any>) {
    await this.assertAgentAccess(agentId, userId, true);
    const updateResult = await this.agentUpdateService.updateAgent({ agentId, updates: patch, userId });
    await auditLogger.logUpdate(agentId, {}, patch, { userId });
    return updateResult;
  }

  /** Trigger an execution for the agent */
  async triggerExecution(agentId: string, userId: string, inputData: any = {}, executionContext: any = {}) {
    const agent = await this.assertAgentAccess(agentId, userId, true);
    if (!agent.isActive) {
      throw new AgentBuilderError(
        'AGENT_OPERATOR_INACTIVE',
        'Agent is not active',
        'Activate the agent before running executions.',
        { agentId }
      );
    }

    const execution = await prisma.agentExecution.create({
      data: {
        id: randomUUID(),
        agentId,
        triggeredBy: 'MANUAL',
        triggerUserId: userId,
        inputData,
        executionContext,
        status: 'QUEUED',
        startedAt: new Date(),
      },
    });

    await inngest.send({
      name: 'agent/execute',
      data: { executionId: execution.id, agentId, userId, inputData, executionContext },
    });

    return { executionId: execution.id, status: 'QUEUED' };
  }

  private async assertAgentAccess(agentId: string, userId: string, requireWrite = false) {
    const agent = await prisma.aiAgent.findUnique({
      where: { id: agentId },
      include: {
        tools: {
          where: { isActive: true },
        },
        triggers: {
          where: { isActive: true },
        },
        schedules: {
          where: { isActive: true },
        },
      },
    });
    if (!agent) {
      throw new AgentBuilderError('AGENT_NOT_FOUND', 'Agent not found', 'No agent found with that ID.', { agentId });
    }

    const allowed = await this.permissionService.checkAgentPermission(agentId, userId, requireWrite ? 'write' : 'read');
    if (!allowed) {
      throw new AgentBuilderError('PERMISSION_DENIED', 'Permission denied', 'You do not have access to this agent.', {
        agentId,
        userId,
      });
    }
    return agent;
  }
}

export const agentOperatorService = new AgentOperatorService();
