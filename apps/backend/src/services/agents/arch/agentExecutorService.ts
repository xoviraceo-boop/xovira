import { openai } from '@/lib/openai';
import { fetchModel } from '@/utils/ai/fetchModel';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { CircuitBreaker, RetryHandler, ErrorClassifier } from '@/utils/circuitBreaker';
import { PermissionService } from '../safety/permissionService';
import { PromptSandbox } from '../safety/promptSandbox';
import { auditLogger } from '../audit/auditLogger';
import { AgentBuilderError } from './agentBuilderService';
import { checkAgentTokenLimit, updateAgentUsage, estimateTokens, countAgentTokens } from '@/utils/ai/agentUsageTracking';
import { TokenBudgetManager } from '../optimization/tokenBudgetManager';
import { agentBuilderContextService, UserContext } from '../state/agentBuilderContextService';
import { AI_EXECUTOR_FLOW_GUIDE } from '../instructions/aiExecutorFlowGuide';
import { EntityScopeInferrer } from '../context/entityScopeInferrer';
import { AutomationInferrer } from '../inference/automationInferrer';
import { InputSanitizer } from '../safety/inputSanitizer';
import { ResponseCache } from '../cache/responseCache';
import { redis } from '@/lib/redis';
import {
  agentBuilderStateService,
  ConversationState,
  AgentDraft,
} from '../state/agentBuilderStateService';
import { QuickAction } from '../generation/agentBuilderQuickActions';
import { AGENT_CONSTANTS } from '../constants/agentConstants';
import { intentInferenceService } from '../inference/intentInferenceService';
import { extractJson } from '@/utils/ai/jsonParsing';
import { SkillInferenceService, skillInferenceService } from '../inference/skillInferenceService';
import { BUILT_IN_SKILLS } from '../registry/skillRegistry';

const ExecutorResponseSchema = z.object({
  response: z.string(),
  suggestedActions: z
    .array(
      z.object({
        type: z.enum(['execute', 'info']),
        label: z.string().max(120),
        payload: z.any().optional(),
      })
    )
    .default([]),
});

const ExecutorWelcomeResponseSchema = z.object({
  welcomeMessage: z.string(),
});


export interface AgentExecutorDependencies {
  permissionService: PermissionService;
  promptSandbox: PromptSandbox;
  tokenBudgetManager: TokenBudgetManager;
  entityScopeInferrer: EntityScopeInferrer;
  automationInferrer: AutomationInferrer;
  inputSanitizer: InputSanitizer;
  responseCache: ResponseCache;
  skillInferenceService: SkillInferenceService;
}

export class AgentExecutorService {
  // Lock timeout in seconds (1 minute)
  private readonly LOCK_TIMEOUT = AGENT_CONSTANTS.LOCK_TIMEOUT;
  private readonly LOCK_KEY_PREFIX = 'agent_executor:lock:';

  private readonly circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000,
    halfOpenMaxCalls: 3
  });
  private readonly retryHandler = new RetryHandler();
  private readonly errorClassifier = new ErrorClassifier();

  private readonly permissionService: PermissionService;
  private readonly promptSandbox: PromptSandbox;
  private readonly tokenBudgetManager: TokenBudgetManager;
  private readonly entityScopeInferrer: EntityScopeInferrer;
  private readonly automationInferrer: AutomationInferrer;
  private readonly inputSanitizer: InputSanitizer;
  private readonly responseCache: ResponseCache;
  private readonly skillInferenceService: SkillInferenceService;

  constructor(dependencies: AgentExecutorDependencies) {
    this.permissionService = dependencies.permissionService;
    this.promptSandbox = dependencies.promptSandbox;
    this.tokenBudgetManager = dependencies.tokenBudgetManager;
    this.entityScopeInferrer = dependencies.entityScopeInferrer;
    this.automationInferrer = dependencies.automationInferrer;
    this.inputSanitizer = dependencies.inputSanitizer;
    this.responseCache = dependencies.responseCache;
    this.skillInferenceService = dependencies.skillInferenceService;
  }

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
    return this.initializeConversationInternal(userId, agentId, conversationId, skipWelcome);
  }

  // Method `inferExecutionIntent` replaced by `intentInferenceService.inferExecutorIntent`

  private async initializeConversationInternal(
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

    // If agentId provided but no conversationId, check if current user has an existing conversation for this agent
    if (agentId && !conversationId) {
      const existingConversation = await prisma.aiConversation.findFirst({
        where: {
          agentId,
          userId,
          conversationType: 'AGENT_EXECUTOR'
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingConversation) {
        // Agent has existing conversation - recursively call with conversationId
        console.log(`[AgentExecutor] Agent ${agentId} has existing conversation ${existingConversation.id} for user ${userId}, loading it`);
        return this.initializeConversation(userId, agentId, existingConversation.id, skipWelcome);
      }
    }

    // Create new conversation state
    console.log(`[AgentExecutor] Creating new conversation for agent ${agentId}`);
    conversationState = await agentBuilderStateService.createConversationState(
      userId,
      agentId,
      'AGENT_EXECUTOR'
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
      }

      return {
        conversationId: conversationState.conversationId,
        conversationState,
        userContext,
        welcomeMessage: '',
        quickActions: [],
        followups: [],
      };
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
        response_format: { type: 'json_object' },
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
      parsed = ExecutorWelcomeResponseSchema.safeParse(extractJson(content));
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
    }).catch(() => { });

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

      // --- NEW: INFER INTENT (Injected Service) ---
      const { intent } = await intentInferenceService.inferExecutorIntent(sanitizedMessage, conversationState.conversationHistory);

      // Handle WRONG CONTEXT (Config Request in Executor)
      if (intent === AGENT_CONSTANTS.INTENT.EXECUTOR.IRRELEVANT) {
        const wrongContextResponse = AGENT_CONSTANTS.PROMPTS.WRONG_CONTEXT_EXECUTION
          .replace('{ROLE}', 'Executor')
          .replace('{VIEW_NAME}', 'Executor')
          .replace('{PURPOSE}', 'running and monitoring agents')
          .replace('{MESSAGE}', sanitizedMessage)
          .replace('{ALLOWED_ACTIONS}', 'executing tasks or checking status');

        await agentBuilderStateService.addMessageToHistory(conversationId, 'assistant', wrongContextResponse);

        const refreshedState = await agentBuilderStateService.getConversationState(conversationId);
        return {
          response: wrongContextResponse,
          conversationState: refreshedState!,
          agentDraft: refreshedState!.agentDraft,
          quickActions: [],
          suggestedActions: [
            { type: 'info', label: 'Go to Operator (Builder)' }
          ]
        };
      }

      // Infer automations intent
      const automationInference = await this.automationInferrer.infer(
        refreshedState.conversationHistory.map((h) => ({
          role: h.role,
          content: h.content,
        })),
        sanitizedMessage,
        refreshedState.agentDraft,
        userContext,
        userId
      );

      // --- SKILL INFERENCE ---
      const skillInference = await this.skillInferenceService.inferSkills(
        sanitizedMessage,
        `Current capabilities: ${agent.capabilities?.join(', ') || 'None'}. Description: ${agent.description || ''}`,
        BUILT_IN_SKILLS
      );

      const currentSkillIds = (agent as any).agentSkills?.map((as: any) => as.skill?.name || as.skillId) || [];
      const missingSkills = skillInference.suggestedSkills.filter(s => !currentSkillIds.includes(s) && skillInference.confidence > 0.7);

      // Build executor response
      const model = await fetchModel();
      const guardrails = AGENT_CONSTANTS.PROMPTS.QUALITY_GUARDRAILS;

      const systemPrompt = `You are an Agent Executor assistant for Xovira.
You can: (1) answer questions about usage and results, (2) infer execution inputs, (3) suggest running the agent.
Use the agent data, workspace context, and recent executions. Do NOT suggest configuration changes.
If missingSkills are provided, WARN the user that the agent lacks these skills to perform the requested task.
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
            automationInference,
            missingSkills: missingSkills.length > 0 ? missingSkills : undefined,
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
                          type: { type: 'string', enum: ['execute', 'info'] },
                          label: { type: 'string' },
                          payload: { type: 'object' },
                        },
                        required: ['type', 'label'],
                      },
                    },
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
      }).catch(() => { });

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
      let response: string;

      if (!sandboxed.valid) {
        // If the sanitized version is still usable, prefer it over a generic error
        if (sandboxed.sanitized && sandboxed.sanitized.trim().length > 0) {
          console.warn('[AgentExecutor] Response had safety violations but sanitized version is usable:', sandboxed.errors);
          response = sandboxed.sanitized;
        } else {
          // Inform the user what needs to be adjusted rather than silently failing
          const violationSummary = sandboxed.errors.join('; ');
          console.warn('[AgentExecutor] Response failed safety validation, returning user-facing guidance:', violationSummary);
          response = `⚠️ I wasn't able to generate a safe response for that request.\n\n**What needs to be adjusted:**\n${sandboxed.errors.map(e => `- ${e}`).join('\n')}\n\nPlease review the agent's system prompt and capabilities to ensure they don't include restricted instructions, then try again.`;
        }
      } else {
        response = sandboxed.sanitized || parsed.data.response;
      }
      const suggestedActions = parsed.data.suggestedActions.slice(0, 3);

      // Execute agent if suggested by the assistant
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
        suggestedActions,
      };
    } finally {
      await this.releaseLock(conversationId);
    }
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

    try {
      await inngest.send({
        name: 'agent/execute',
        data: { executionId: execution.id, agentId, userId, inputData, executionContext },
      });
    } catch (inngestError: any) {
      console.error('[AgentExecutor] Failed to send event to Inngest:', inngestError);

      // Provide more helpful logs in development
      if (process.env.NODE_ENV === 'development') {
        if (inngestError.message?.includes('401') || inngestError.message?.includes('key unknown')) {
          console.warn('[AgentExecutor] 💡 TIP: Inngest 401/403 errors are usually caused by a missing or invalid INNGEST_EVENT_KEY in .env. For local development, set INNGEST_EVENT_KEY=local and run the Inngest Dev Server (npx inngest-cli dev).');
        } else if (inngestError.code === 'ECONNREFUSED') {
          console.warn('[AgentExecutor] 💡 TIP: Connection refused to Inngest. Is the Inngest Dev Server running? Start it with: npx inngest-cli dev');
        }
      }

      throw inngestError;
    }

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
        agentSkills: {
          include: { skill: true }
        }
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

export const agentExecutorService = new AgentExecutorService({
  permissionService: new PermissionService(),
  promptSandbox: new PromptSandbox(),
  tokenBudgetManager: new TokenBudgetManager(),
  entityScopeInferrer: new EntityScopeInferrer(),
  automationInferrer: new AutomationInferrer(),
  inputSanitizer: new InputSanitizer(),
  responseCache: new ResponseCache(),
  skillInferenceService: skillInferenceService,
});
