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
import { AgentUpdateService, type AgentUpdateRequest } from './agentUpdateService';
import { AgentBuilderError } from './agentBuilderService';
import { checkAgentTokenLimit, updateAgentUsage, estimateTokens, countAgentTokens } from '@/utils/ai/agentUsageTracking';
import { TokenBudgetManager } from './optimization/tokenBudgetManager';
import { agentBuilderContextService, UserContext } from './agentBuilderContextService';
import { AI_EXECUTOR_FLOW_GUIDE } from './aiExecutorFlowGuide';
import { EntityScopeInferrer } from './context/entityScopeInferrer';
import { ConfigurationExtractor } from './extraction/configurationExtractor';
import { ConfigurationMerger } from './extraction/configurationMerger';
import { AutomationInferrer } from './inference/automationInferrer';
import { InputSanitizer } from './safety/inputSanitizer';
import { ResponseCache } from './cache/responseCache';
import { redis } from '@/lib/redis';
import {
  agentBuilderStateService,
  ConversationState,
  AgentDraft,
} from './agentBuilderStateService';
import { QuickAction } from './agentBuilderQuickActions';

const ExecutorResponseSchema = z.object({
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

const ExecutorWelcomeResponseSchema = z.object({
  welcomeMessage: z.string(),
});

export class AgentExecutorService {
  // Lock timeout in seconds (1 minute)
  private readonly LOCK_TIMEOUT = 60;
  private readonly LOCK_KEY_PREFIX = 'agent_executor:lock:';
  
  private readonly circuitBreaker = new CircuitBreaker({ 
    failureThreshold: 5, 
    resetTimeout: 60000, 
    halfOpenMaxCalls: 3 
  });
  private readonly retryHandler = new RetryHandler();
  private readonly errorClassifier = new ErrorClassifier();
  private readonly permissionService = new PermissionService();
  private readonly promptSandbox = new PromptSandbox();
  private readonly tokenBudgetManager = new TokenBudgetManager();
  private readonly agentUpdateService = new AgentUpdateService();
  private readonly entityScopeInferrer = new EntityScopeInferrer();
  private readonly configurationExtractor = new ConfigurationExtractor();
  private readonly configurationMerger = new ConfigurationMerger();
  private readonly automationInferrer = new AutomationInferrer();
  private readonly inputSanitizer = new InputSanitizer();
  private readonly responseCache = new ResponseCache();

  private async runCompletion(request: any, context: { operation: string; agentId: string; userId: string }) {
    try {
      return await this.retryHandler.retry(
        () => this.circuitBreaker.execute(() => openai.chat.completions.create(request)),
        { maxAttempts: 3, baseDelay: 800 }
      );
    } catch (error) {
      const classification = this.errorClassifier.classify(error as Error);
      const errorId = randomUUID();
      console.error('[AgentExecutor] LLM failed', { errorId, context, classification, error });
      throw new AgentBuilderError(
        'AGENT_EXECUTOR_COMPLETION_FAILED',
        `LLM call failed: ${classification.type}`,
        'I could not process that request. Please try again shortly.',
        { errorId, classification }
      );
    }
  }

  /**
   * Acquire a lock for a conversation to prevent concurrent processing
   */
  private async acquireLock(lockKey: string): Promise<boolean> {
    try {
      const result = await redis.set(lockKey, '1', 'EX', this.LOCK_TIMEOUT, 'NX');
      return result === 'OK';
    } catch (error) {
      console.error(`[AgentExecutor] Failed to acquire lock for ${lockKey}:`, error);
      // If Redis fails, allow processing (fail open)
      return true;
    }
  }

  /**
   * Release a lock for a conversation
   */
  private async releaseLock(lockKey: string): Promise<void> {
    try {
      await redis.del(lockKey);
    } catch (error) {
      console.error(`[AgentExecutor] Failed to release lock for ${lockKey}:`, error);
      // Don't throw - lock will expire anyway
    }
  }

  async initializeConversation(
    userId: string,
    agentId: string,
    conversationId?: string,
    skipWelcome?: boolean
  ): Promise<{
    conversationId: string;
    conversationState: ConversationState;
    userContext: UserContext;
    welcomeMessage: string;
    quickActions: QuickAction[];
    followups?: Array<{ id: string; label: string }>;
  }> {
    const agent = await this.assertAgentAccess(agentId, userId);
    let userContext = await agentBuilderContextService.fetchUserContext(userId);

    // Enrich user context with entity scope if available
    try {
      userContext = await this.entityScopeInferrer.inferAndFetchEntityScope(
        '',
        agent.systemPrompt
          ? [{ role: 'system', content: agent.systemPrompt }]
          : [],
        userContext,
        userId
      );
    } catch (error) {
      console.error('[AgentExecutor] Failed to infer entity scope for executor initialization:', error);
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
          console.log(`[AgentExecutor] Conversation ${conversationId} is being initialized, loading existing state`);
        }
      }

      try {
        console.log(`[AgentExecutor] Loading existing conversation: ${conversationId}`);
        const existingState = await agentBuilderStateService.getConversationState(conversationId);
        if (!existingState) {
          throw new AgentBuilderError(
            'AGENT_EXECUTOR_CONVERSATION_NOT_FOUND',
            `Conversation ${conversationId} not found`,
            'This conversation could not be found. Please start a new conversation.',
            { conversationId, userId }
          );
        }
        if (existingState.userId !== userId) {
          throw new AgentBuilderError(
            'AGENT_EXECUTOR_UNAUTHORIZED',
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

        if (!hasMessages && !skipWelcome) {
          console.log(`[AgentExecutor] Conversation ${conversationId} is empty, generating welcome message`);

          // Generate welcome message for empty existing conversation
          const welcomeMessage = await this.generateWelcomeMessage(userContext, agent, userId);

          // Add welcome message to history
          await agentBuilderStateService.addMessageToHistory(
            conversationState.conversationId,
            'assistant',
            welcomeMessage
          );

          // Refresh conversation state to get updated history with welcome message
          const refreshedState = await agentBuilderStateService.getConversationState(conversationId);
          if (!refreshedState) {
            throw new AgentBuilderError(
              'AGENT_EXECUTOR_STATE_REFRESH_FAILED',
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
        console.log(`[AgentExecutor] Successfully loaded existing conversation: ${conversationId}, messages: ${conversationState.conversationHistory.length}`);
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
      const agentWithConversations = await prisma.aiAgent.findUnique({
        where: { id: agentId },
        include: { conversations: { where: { conversationType: 'AGENT_EXECUTOR' }, orderBy: { createdAt: 'desc' }, take: 1 } },
      });

      if (agentWithConversations?.conversations?.[0]) {
        // Agent has existing conversation - recursively call with conversationId
        console.log(`[AgentExecutor] Agent ${agentId} has existing conversation ${agentWithConversations.conversations[0].id}, loading it`);
        return this.initializeConversation(userId, agentId, agentWithConversations.conversations[0].id);
      }
    }

    // Create new conversation state
    console.log(`[AgentExecutor] Creating new conversation for agent ${agentId}`);
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
        console.log(`[AgentExecutor] Messages already exist for new conversation ${conversationState.conversationId}`);
        const refreshedState = await agentBuilderStateService.getConversationState(conversationState.conversationId);
        if (!refreshedState) {
          throw new AgentBuilderError(
            'AGENT_EXECUTOR_STATE_REFRESH_FAILED',
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
        const welcomeMessage = await this.generateWelcomeMessage(userContext, agent, userId);

        await agentBuilderStateService.addMessageToHistory(
          conversationState.conversationId,
          'assistant',
          welcomeMessage
        );

        const refreshedState = await agentBuilderStateService.getConversationState(conversationState.conversationId);
        if (!refreshedState) {
          throw new AgentBuilderError(
            'AGENT_EXECUTOR_STATE_REFRESH_FAILED',
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
          followups: [],
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

  /**
   * Extract welcome message generation to separate method
   */
  private async generateWelcomeMessage(
    userContext: UserContext,
    agent: any,
    userId: string
  ): Promise<string> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are the Xovira Agent Executor assistant.

=== AI EXECUTOR FLOW GUIDE (REFERENCE) ===
${AI_EXECUTOR_FLOW_GUIDE}
=== END OF FLOW GUIDE ===

Generate a short, friendly welcome message for the executor panel for this agent.

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
          },
          userContext,
        }),
      },
    ];

    // Fetch model
    const model = await fetchModel();

    const estimatedTokens = estimateTokens(JSON.stringify(messages)) + 500;

    // Check token limit
    const tokenCheck = await checkAgentTokenLimit(userId, estimatedTokens);
    if (!tokenCheck.allowed) {
      throw new AgentBuilderError(
        'AGENT_EXECUTOR_INSUFFICIENT_TOKENS',
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
      { operation: 'executor_initialize', agentId: agent.id, userId }
    );

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new AgentBuilderError(
        'AGENT_EXECUTOR_WELCOME_FAILED',
        'Failed to generate executor welcome message',
        'I could not prepare the executor view. Please try again.',
        { agentId: agent.id, userId }
      );
    }

    let parsed;
    try {
      parsed = ExecutorWelcomeResponseSchema.safeParse(JSON.parse(content));
    } catch (error) {
      throw new AgentBuilderError(
        'AGENT_EXECUTOR_WELCOME_PARSE_FAILED',
        'Failed to parse executor welcome response',
        'I could not prepare the executor view. Please try again.',
        { agentId: agent.id, userId, error: error instanceof Error ? error.message : String(error) }
      );
    }

    if (!parsed.success) {
      throw new AgentBuilderError(
        'AGENT_EXECUTOR_WELCOME_INVALID',
        'Executor welcome response did not match schema',
        'I could not prepare the executor view. Please try again.',
        { agentId: agent.id, userId, issues: parsed.error.issues }
      );
    }

    // Count actual tokens and update usage
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
        console.error('Failed to update agent usage for executor initialization:', error);
      }
    }).catch(() => {});

    return parsed.data.welcomeMessage;
  }

  /**
   * Process executor message - similar to agentBuilderService.processMessage
   * Handles configuration extraction, automation inference, and updates
   */
  async processMessage(
    conversationId: string,
    agentId: string,
    message: string,
    userId: string
  ): Promise<{
    response: string;
    conversationState: ConversationState;
    agentDraft: AgentDraft;
    quickActions: QuickAction[];
    followups?: Array<{ id: string; label: string }>;
    patch?: Record<string, any>;
    suggestedActions?: Array<{ type: string; label: string; payload?: any }>;
  }> {
    // Sanitize user input to prevent prompt injection
    const sanitizedMessage = this.inputSanitizer.sanitize(message);

    // Acquire lock to prevent concurrent processing
    const lockAcquired = await this.acquireLock(conversationId);
    if (!lockAcquired) {
      throw new AgentBuilderError(
        'AGENT_EXECUTOR_CONVERSATION_LOCKED',
        `Conversation ${conversationId} is being processed by another request`,
        'This conversation is currently being processed. Please wait a moment and try again.',
        { conversationId, userId }
      );
    }

    try {
      // Get conversation state
      const conversationState =
        await agentBuilderStateService.getConversationState(conversationId);

      if (!conversationState) {
        throw new AgentBuilderError(
          'AGENT_EXECUTOR_CONVERSATION_NOT_FOUND',
          `Conversation ${conversationId} not found`,
          'This conversation could not be found. Please start a new conversation.',
          { conversationId, userId }
        );
      }

      // Verify user owns this conversation
      if (conversationState.userId !== userId) {
        throw new AgentBuilderError(
          'AGENT_EXECUTOR_UNAUTHORIZED',
          `Unauthorized: Conversation ${conversationId} does not belong to user ${userId}`,
          'You do not have access to this conversation.',
          { conversationId, userId }
        );
      }

      // Get agent
      const agent = await this.assertAgentAccess(agentId, userId);

      // Get user context
      let userContext = await agentBuilderContextService.fetchUserContext(userId);

      // Enrich user context with entity scope if available
      try {
        userContext = await this.entityScopeInferrer.inferAndFetchEntityScope(
          sanitizedMessage,
          conversationState.conversationHistory.map(h => ({
            role: h.role,
            content: h.content,
          })),
          userContext,
          userId
        );
      } catch (error) {
        console.error('[AgentExecutor] Failed to infer entity scope for executor chat:', error);
      }

      // Add user message to history
      await agentBuilderStateService.addMessageToHistory(
        conversationId,
        'user',
        sanitizedMessage
      );

      // Refresh conversation state
      const refreshedState =
        await agentBuilderStateService.getConversationState(conversationId);

      if (!refreshedState) {
        throw new AgentBuilderError(
          'AGENT_EXECUTOR_STATE_REFRESH_FAILED',
          `Failed to refresh conversation state for ${conversationId}`,
          'Failed to load conversation state. Please try again.',
          { conversationId, userId }
        );
      }

      // Get recent executions
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

      // Try to extract configuration if user is requesting changes
      let extractedConfig: any = null;
      const lowerMessage = sanitizedMessage.toLowerCase();
      const isConfigChange = lowerMessage.includes('change') || 
                           lowerMessage.includes('update') || 
                           lowerMessage.includes('modify') ||
                           lowerMessage.includes('add') ||
                           lowerMessage.includes('remove');

      if (isConfigChange) {
        try {
          extractedConfig = await this.configurationExtractor.extract(
            sanitizedMessage,
            refreshedState,
            userContext,
            userId,
            conversationId
          );
        } catch (error) {
          console.error('[AgentExecutor] Configuration extraction failed:', error);
        }
      }

      // Merge extracted configuration with current agent state (similar to agentBuilderService)
      let mergedUpdates: Partial<AgentUpdateRequest['updates']> = {};
      if (extractedConfig && extractedConfig.confidenceScore !== undefined && extractedConfig.confidenceScore > 0) {
        try {
          // Create a draft from current agent state
          const currentDraft: AgentDraft = {
            name: agent.name,
            description: agent.description || undefined,
            agentType: agent.agentType,
            systemPrompt: agent.systemPrompt || undefined,
            capabilities: agent.capabilities || [],
            constraints: agent.constraints || [],
            status: agent.status === 'ACTIVE' ? 'ready' : 'draft',
            modelConfig: agent.modelId ? {
              modelId: agent.modelId,
              temperature: agent.temperature,
              maxTokens: agent.maxTokens,
            } : undefined,
          };

          // Merge extracted configuration into draft
          const mergedDraft = this.configurationMerger.mergeConfiguration(currentDraft, extractedConfig);

          // Convert merged draft to update format for agentUpdateService
          mergedUpdates = {
            name: mergedDraft.name !== agent.name ? mergedDraft.name : undefined,
            description: mergedDraft.description !== agent.description ? mergedDraft.description : undefined,
            avatar: mergedDraft.avatar !== agent.avatar ? mergedDraft.avatar : undefined,
            systemPrompt: mergedDraft.systemPrompt !== agent.systemPrompt ? mergedDraft.systemPrompt : undefined,
            personality: mergedDraft.personality || undefined,
            capabilities: mergedDraft.capabilities?.length ? mergedDraft.capabilities : undefined,
            constraints: mergedDraft.constraints?.length ? mergedDraft.constraints : undefined,
            modelConfig: mergedDraft.modelConfig ? {
              modelId: mergedDraft.modelConfig.modelId,
              temperature: mergedDraft.modelConfig.temperature,
              maxTokens: mergedDraft.modelConfig.maxTokens,
            } : undefined,
            tools: mergedDraft.tools?.map(t => ({
              id: t.id || t.name,
              config: t.config || {},
              isActive: t.isActive !== false,
            })),
            triggers: mergedDraft.triggers?.map(t => ({
              type: t.triggerType,
              config: t.config || {},
            })),
            rules: mergedDraft.rules,
          };

          // Remove undefined values
          Object.keys(mergedUpdates).forEach(key => {
            if (mergedUpdates[key as keyof typeof mergedUpdates] === undefined) {
              delete mergedUpdates[key as keyof typeof mergedUpdates];
            }
          });
        } catch (error) {
          console.error('[AgentExecutor] Failed to merge configuration:', error);
        }
      }

      // Try to infer automations if relevant
      let automationInference: any = null;
      const isAutomationRelated = lowerMessage.includes('automat') || 
                                 lowerMessage.includes('trigger') || 
                                 lowerMessage.includes('when') ||
                                 lowerMessage.includes('schedule');

      if (isAutomationRelated) {
        try {
          // Create a draft from current agent state
          const currentDraft: AgentDraft = {
            name: agent.name,
            description: agent.description || undefined,
            agentType: agent.agentType,
            systemPrompt: agent.systemPrompt || undefined,
            capabilities: agent.capabilities || [],
            constraints: agent.constraints || [],
            status: agent.status === 'ACTIVE' ? 'ready' : 'draft',
          };

          automationInference = await this.automationInferrer.infer(
            refreshedState.conversationHistory.map(h => ({
              role: h.role,
              content: h.content,
            })),
            sanitizedMessage,
            currentDraft,
            userContext,
            userId
          );
        } catch (error) {
          console.error('[AgentExecutor] Automation inference failed:', error);
        }
      }

      // Build executor response
      const model = await fetchModel();
      const guardrails = `QUALITY
- Be concise, factual, and accurate to this agent's stored configuration.
- Never invent tools, triggers, or capabilities that the agent does not have.
- When suggesting updates, provide a minimal JSON patch (partial object) under patch.
- When suggesting an execution, include a suggested input payload under payload.
- Keep at most 3 suggestedActions; labels < 80 chars.`;

      const systemPrompt = `You are an Agent Executor assistant for Xovira.
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
            message: sanitizedMessage,
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
              stats: {
                totalExecutions: agent.totalExecutions,
                successfulRuns: agent.successfulRuns,
                failedRuns: agent.failedRuns,
                lastExecutedAt: agent.lastExecutedAt,
              },
            },
            userContext,
            executions: executionsSummary,
            extractedConfig,
            automationInference,
          }),
        },
      ];

      const estimatedTokens = this.tokenBudgetManager.estimateTokens(JSON.stringify(messages)) + 800;
      const tokenCheck = await checkAgentTokenLimit(userId, estimatedTokens);
      if (!tokenCheck.allowed) {
        throw new AgentBuilderError(
          'AGENT_EXECUTOR_TOKEN_LIMIT',
          'Token limit exceeded for executor chat',
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
                name: 'executor_response',
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
          tool_choice: { type: 'function', function: { name: 'executor_response' } },
        },
        { operation: 'executor_chat', agentId: agent.id, userId }
      );

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (!toolCall || toolCall.function.name !== 'executor_response') {
        throw new AgentBuilderError(
          'AGENT_EXECUTOR_NO_RESPONSE',
          'Executor did not return a structured response',
          'I was unable to craft an answer. Please try again.',
          { agentId: agent.id, userId }
        );
      }

      // Count tokens and update usage
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
          console.error('Failed to update agent usage for executor chat:', error);
        }
      }).catch(() => {});

      const parsed = ExecutorResponseSchema.safeParse(JSON.parse(toolCall.function.arguments));
      if (!parsed.success) {
        throw new AgentBuilderError(
          'AGENT_EXECUTOR_PARSE_FAILED',
          'Failed to parse executor response',
          'I could not parse the result. Please try again.',
          { issues: parsed.error.issues }
        );
      }

      const sandboxed = await this.promptSandbox.validatePrompt(parsed.data.response);
      if (!sandboxed.valid) {
        throw new AgentBuilderError(
          'AGENT_EXECUTOR_SAFETY',
          'Response failed safety validation',
          'The generated response did not pass safety checks.',
          { violations: sandboxed.errors }
        );
      }

      const response = sandboxed.sanitized || parsed.data.response;
      const suggestedActions = parsed.data.suggestedActions.slice(0, 3);
      const patch = parsed.data.patch;

      // Apply merged configuration updates from extracted config (similar to agentBuilderService)
      if (Object.keys(mergedUpdates).length > 0) {
        try {
          console.log('[AgentExecutor] Applying merged configuration updates:', Object.keys(mergedUpdates));
          await this.agentUpdateService.updateAgent({
            agentId,
            updates: mergedUpdates,
            userId,
          });
          // Refresh agent to get updated state before execution
          const updatedAgent = await this.assertAgentAccess(agentId, userId);
          console.log('[AgentExecutor] Agent updated successfully with merged configuration');
        } catch (error) {
          console.error('[AgentExecutor] Failed to apply merged configuration updates:', error);
          // Continue execution even if update fails
        }
      }

      // Apply patch from LLM response if provided and suggested
      if (patch && suggestedActions.some((action) => action.type === 'update')) {
        try {
          await this.applySuggestedChanges(agentId, userId, patch);
        } catch (error) {
          console.error('[AgentExecutor] Failed to apply suggested changes:', error);
        }
      }

      // Execute agent with updated configurations (similar to agentBuilderService)
      const executeActions = suggestedActions.filter((action) => action.type === 'execute');
      if (executeActions.length > 0) {
        for (const action of executeActions) {
          try {
            await this.triggerExecution(
              agentId,
              userId,
              action.payload || {},
              {
                source: 'executor',
                conversationId,
                message: sanitizedMessage,
                label: action.label,
                appliedUpdates: Object.keys(mergedUpdates).length > 0 ? mergedUpdates : undefined,
              }
            );
          } catch (error) {
            console.error('[AgentExecutor] Failed to trigger execution from executor chat:', error);
          }
        }
      }

      // Add assistant message to history
      await agentBuilderStateService.addMessageToHistory(
        conversationId,
        'assistant',
        response,
        {
          suggestedActions,
          patch,
          extractedConfig,
          automationInference,
        }
      );

      // Update conversation state
      const updatedState = await agentBuilderStateService.updateConversationState(conversationId, {
        agentDraft: refreshedState.agentDraft,
      });

      return {
        response,
        conversationState: updatedState,
        agentDraft: updatedState.agentDraft,
        quickActions: [],
        followups: [],
        patch,
        suggestedActions,
      };
    } finally {
      await this.releaseLock(conversationId);
    }
  }

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
        'AGENT_EXECUTOR_INACTIVE',
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

export const agentExecutorService = new AgentExecutorService();
