import { openai } from '@/lib/openai';
import { fetchModel } from '@/utils/ai/fetchModel';
import { agentBuilderContextService, UserContext } from './agentBuilderContextService';
import {
  agentBuilderStateService,
  ConversationState,
  AgentDraft,
  ConversationStage,
} from './agentBuilderStateService';
import { agentBuilderPromptService } from './agentBuilderPromptService';
import { agentBuilderEntityService } from './agentBuilderEntityService';
import { quickActionGenerator, QuickAction } from './agentBuilderQuickActions';
import { AI_BUILDER_FLOW_GUIDE } from './aiBuilderFlowGuide';
import { type Tool, AgentTriggerType, AutomationTriggerType, TriggerType, AgentType } from './types';
import {
  checkAgentTokenLimit,
  updateAgentUsage,
  estimateTokens,
  countAgentTokens,
} from '@/utils/ai/agentUsageTracking';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { redis } from '@/lib/redis';
import { randomBytes } from 'crypto';
// New imports for validation, safety, and resilience
import { ConfigurationValidator } from './validation/configurationValidator';
import {
  SafetyEvaluator,
  PolicyEngine,
  CapabilityWhitelist,
  ToolAccessController,
} from './safety/safetyEvaluator';
import { PromptSandbox } from './safety/promptSandbox';
import { CircuitBreaker, RetryHandler, ErrorClassifier } from '@/utils/circuitBreaker';
import { AgentVersionControl, ConflictResolver, OptimisticLockManager } from './versioning/agentVersionControl';
import { AuditLogger } from './audit/auditLogger';
import { ResponseCache } from './cache/responseCache';
import { TokenBudgetManager } from './optimization/tokenBudgetManager';
import { ConfigurationExtractor } from './extraction/configurationExtractor';
import { extractFollowupsFromText } from './extraction/followupExtractor';
import { AutomationInferrer } from './inference/automationInferrer';
import { PromptGenerator } from './generation/promptGenerator';
import { ConfigurationMerger } from './extraction/configurationMerger';
import { StageOrchestrator, type StageReadinessAssessment } from './orchestration/stageOrchestrator';
import { InputSanitizer } from './safety/inputSanitizer';
import { PermissionService } from './safety/permissionService';
import { EntityScopeInferrer } from './context/entityScopeInferrer';
import {
  InferredEntityScopeSchema,
  ExtractedConfigurationSchema,
  FollowupResponseSchema,
  StageReadinessSchema,
  type InferredAutomation,
  type ExtractedConfiguration,
} from './schemas';

// Domain-specific error types
export class AgentBuilderError extends Error {
  constructor(
    public code: string,
    message: string,
    public userMessage?: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AgentBuilderError';
  }
}

export class AgentBuilderService {
  // Lock timeout in seconds (1 minute - reduced from 5 for better responsiveness)
  private readonly LOCK_TIMEOUT = 60;
  private readonly LOCK_KEY_PREFIX = 'agent_builder:lock:';

  // Service instances
  private readonly validator = new ConfigurationValidator();
  private readonly safetyEvaluator = new SafetyEvaluator();
  private readonly policyEngine = new PolicyEngine();
  private readonly capabilityWhitelist = new CapabilityWhitelist();
  private readonly toolAccessController = new ToolAccessController();
  private readonly promptSandbox = new PromptSandbox();
  private readonly circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000,
    halfOpenMaxCalls: 3,
  });

  // Quality guardrails appended to system prompts to enforce enterprise-grade outputs
  private readonly QUALITY_GUARDRAILS = `
QUALITY GUARDRAILS (MANDATORY)
- Be concise, factual, and action-oriented; avoid fluff.
- Reflect awareness of system state: stage, readiness, triggers, automation inference, token budget.
- Do not invent tools, triggers, automations, or data not present in context.
- Keep follow-up options <= 4, each < 80 chars, distinct and non-overlapping.
- Ensure safety/policy alignment; refuse out-of-scope asks clearly.
- Provide minimal rationale inline only if helpful; avoid long monologues.
`;
  private readonly retryHandler = new RetryHandler();
  private readonly errorClassifier = new ErrorClassifier();
  private readonly versionControl = new AgentVersionControl();
  private readonly conflictResolver = new ConflictResolver();
  private readonly lockManager = new OptimisticLockManager();
  private readonly auditLogger = new AuditLogger();
  private readonly responseCache = new ResponseCache();
  private readonly tokenBudgetManager = new TokenBudgetManager();
  private readonly configurationExtractor = new ConfigurationExtractor();
  private readonly automationInferrer = new AutomationInferrer();
  private readonly promptGenerator = new PromptGenerator();
  private readonly configurationMerger = new ConfigurationMerger();
  private readonly inputSanitizer = new InputSanitizer();
  private readonly permissionService = new PermissionService();
  private readonly entityScopeInferrer = new EntityScopeInferrer();
  private readonly stageOrchestrator: StageOrchestrator;

  // ** Stage requirements with detailed criteria**
  private readonly STAGE_REQUIREMENTS: Record<ConversationStage, {
    required: string[];
    recommended: string[];
    critical: string[];
  }> = {
    configuration: {
      required: [],
      recommended: [],
      critical: [],
    },
    finalization: {
      required: ['name', 'systemPrompt'],
      recommended: ['description', 'capabilities', 'triggers'],
      critical: ['name', 'systemPrompt'],
    },
    launch: {
      required: ['name', 'systemPrompt'],
      recommended: ['description', 'capabilities', 'triggers', 'tools'],
      critical: ['name', 'systemPrompt'],
    },
  };

  constructor() {
    this.stageOrchestrator = new StageOrchestrator(this.STAGE_REQUIREMENTS);
  }

  /**
   * Generate a unique ID (simple implementation)
   */
  private generateId(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Run an OpenAI chat completion with circuit breaker, retry, and classified error handling.
   * This centralizes resilience behavior for all LLM calls in the builder.
   */
  private async runCompletionWithResilience(
    request: any,
    context: { operation: string; conversationId?: string; userId?: string }
  ): Promise<any> {
    try {
      return await this.retryHandler.retry(
        () => this.circuitBreaker.execute(() => openai.chat.completions.create(request)),
        {
          maxAttempts: 3,
          baseDelay: 1000,
        }
      );
    } catch (error) {
      const classification = this.errorClassifier.classify(error as Error);
      const errorId = this.generateId();

      console.error('[AgentBuilder] LLM call failed', {
        errorId,
        operation: context.operation,
        conversationId: context.conversationId,
        userId: context.userId,
        classification,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new AgentBuilderError(
        'AGENT_BUILDER_COMPLETION_FAILED',
        `LLM call failed for operation ${context.operation}: ${classification.type}`,
        'I had trouble processing this step. Please try again in a moment.',
        { ...context, errorId, classification }
      );
    }
  }

  /**
   * Verify and, if necessary, repair the user-facing response for clarity, safety, and consistency.
   * Uses a lightweight LLM pass; non-blocking fallback to the original response on failures.
   */
  private async verifyBuilderOutput(
    response: string,
    followups: Array<{ id: string; label: string }>,
    context: {
      stage: ConversationStage;
      readiness?: StageReadinessAssessment | null;
      extractedConfig?: ExtractedConfiguration;
    }
  ): Promise<{ response: string; followups: Array<{ id: string; label: string }> }> {
    try {
      const verifyMessages = [
        {
          role: 'system' as const,
          content:
            'You are a QA guardrail. Validate the assistant response for clarity, factuality, safety, and conciseness. Fix minor issues. If acceptable, return pass.',
        },
        {
          role: 'user' as const,
          content: JSON.stringify({
            response,
            followups,
            stage: context.stage,
            readiness: context.readiness,
            extractedConfig: context.extractedConfig,
          }),
        },
      ];

      const verification = await this.runCompletionWithResilience(
        {
          model: 'gpt-4.1-mini',
          messages: verifyMessages,
          temperature: 0,
          max_tokens: 300,
        },
        { operation: 'builder_response_verification' }
      );

      const content = verification.choices?.[0]?.message?.content;
      if (!content) return { response, followups };

      // Expected minimal JSON: { status: "pass"|"fail", fixedResponse?: string, fixedFollowups?: [{id,label}], issues?: string[] }
      try {
        const parsed = JSON.parse(content);
        if (parsed.status === 'pass') {
          return { response, followups };
        }
        const fixedResponse = typeof parsed.fixedResponse === 'string' && parsed.fixedResponse.trim().length > 0
          ? parsed.fixedResponse
          : response;
        const fixedFollowups = Array.isArray(parsed.fixedFollowups)
          ? parsed.fixedFollowups
              .filter((f: any) => f && typeof f.id === 'string' && typeof f.label === 'string')
              .slice(0, 4)
          : followups;
        return { response: fixedResponse, followups: fixedFollowups };
      } catch {
        // If parsing fails, keep original
        return { response, followups };
      }
    } catch (error) {
      console.error('[AgentBuilder] Response verification failed:', error);
      return { response, followups };
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
    const userContext = await agentBuilderContextService.fetchUserContext(userId);

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
            'AGENT_BUILDER_CONVERSATION_NOT_FOUND',
            `Conversation ${conversationId} not found`,
            'This conversation could not be found. Please start a new conversation.',
            { conversationId, userId }
          );
        }
        if (existingState.userId !== userId) {
          throw new AgentBuilderError(
            'AGENT_BUILDER_UNAUTHORIZED',
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
            followups.length > 0 ? { followups } : undefined
          );

          // Refresh conversation state to get updated history with welcome message
          const refreshedState = await agentBuilderStateService.getConversationState(conversationId);
          if (!refreshedState) {
            throw new AgentBuilderError(
              'AGENT_BUILDER_STATE_REFRESH_FAILED',
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
            followups,
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
        include: { conversations: { where: { conversationType: 'AGENT_BUILDER' }, orderBy: { createdAt: 'desc' }, take: 1 } },
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
            'AGENT_BUILDER_STATE_REFRESH_FAILED',
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
        const { welcomeMessage, followups } = await this.generateWelcomeMessage(userContext, userId);

        await agentBuilderStateService.addMessageToHistory(
          conversationState.conversationId,
          'assistant',
          welcomeMessage,
          followups.length > 0 ? { followups } : undefined
        );

        const refreshedState = await agentBuilderStateService.getConversationState(conversationState.conversationId);
        if (!refreshedState) {
          throw new AgentBuilderError(
            'AGENT_BUILDER_STATE_REFRESH_FAILED',
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
    const welcomePrompt = agentBuilderPromptService.buildWelcomePrompt(userContext);

    // Estimate tokens before API call
    const messages = [
      {
        role: 'system' as const,
        content: `You are the Xovira Agent Builder AI. Generate a personalized welcome message based on the user's context. Include numbered options (1, 2, 3, etc.) for automation types. Be conversational and friendly.

=== AI BUILDER FLOW GUIDE (REFERENCE) ===
${AI_BUILDER_FLOW_GUIDE}
=== END OF FLOW GUIDE ===

Follow the flow guide principles: AI-generated messages, numbered options, dynamic follow-ups, context-aware.`,
      },
      {
        role: 'user' as const,
        content: welcomePrompt,
      },
    ];

    // Fetch model
    const model = await fetchModel();

    const estimatedTokens = estimateTokens(JSON.stringify(messages)) + 500; // Add buffer for response

    // Check token limit
    const tokenCheck = await checkAgentTokenLimit(userId, estimatedTokens);
    if (!tokenCheck.allowed) {
      throw new AgentBuilderError(
        'AGENT_BUILDER_INSUFFICIENT_TOKENS',
        `Insufficient tokens: ${tokenCheck.remaining} remaining, need ${estimatedTokens}`,
        `You have ${tokenCheck.remaining} tokens remaining, but need approximately ${estimatedTokens} tokens. Please upgrade your plan or purchase more tokens.`,
        { userId, remaining: tokenCheck.remaining, required: estimatedTokens }
      );
    }

    const welcomeCompletion = await this.runCompletionWithResilience(
      {
        model: model.name,
        messages: [
          {
            role: 'system',
            content: `You are the Xovira Agent Builder AI. Generate a personalized welcome message based on the user's workspace context. Include numbered options (1, 2, 3, etc.) for automation types. Be conversational and friendly.

=== AI BUILDER FLOW GUIDE (REFERENCE) ===
${AI_BUILDER_FLOW_GUIDE}
=== END OF FLOW GUIDE ===

Follow the flow guide principles: AI-generated messages, numbered options, dynamic follow-ups, context-aware.`,
          },
          {
            role: 'user',
            content: welcomePrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_response_with_followups',
              description: 'Generate welcome message and follow-up options',
              parameters: {
                type: 'object',
                properties: {
                  response: {
                    type: 'string',
                    description: 'The welcome message',
                  },
                  followups: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        label: { type: 'string' },
                      },
                      required: ['id', 'label'],
                    },
                  },
                },
                required: ['response', 'followups'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'generate_response_with_followups' } },
      },
      { operation: 'generate_welcome_message', userId }
    );

    let welcomeMessage = agentBuilderPromptService.buildWelcomeMessage(userContext); // Fallback
    let followups: Array<{ id: string; label: string }> = [];

    const toolCall = welcomeCompletion.choices[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function.name === 'generate_response_with_followups') {
      try {
        const rawParsed = JSON.parse(toolCall.function.arguments);
        const validated = FollowupResponseSchema.parse(rawParsed);
        welcomeMessage = validated.response || welcomeMessage;
        followups = validated.followups || [];
      } catch (error) {
        console.error('[AgentBuilder] Failed to parse/validate welcome follow-ups:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          rawArgs: toolCall?.function?.arguments?.substring(0, 200),
        });
        // Fallback: extract from text response
        followups = extractFollowupsFromText(welcomeMessage);
      }
    } else {
      // No tool call or wrong function - use text response
      const textResponse = welcomeCompletion.choices[0]?.message?.content;
      if (textResponse) {
        welcomeMessage = textResponse;
      }
      followups = extractFollowupsFromText(welcomeMessage);
    }

    // Count actual tokens and update usage
    try {
      const tokenCount = await countAgentTokens(
        messages as Array<{ role: string; content: string }>,
        welcomeCompletion.choices[0]?.message?.content || welcomeMessage,
        model.name
      );

      // Get user info for usage tracking
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
      ).catch((error) => {
        console.error('Failed to update agent usage for welcome message:', error);
        // Don't throw - usage tracking failure shouldn't break the flow
      });
    } catch (error) {
      console.error('Error tracking token usage for welcome message:', error);
      // Don't throw - usage tracking failure shouldn't break the flow
    }

    return { welcomeMessage, followups };
  }

  /**
   * Check if agent is ready to launch
   * Note: Triggers are always set to defaults automatically, so we don't check for them
   */
  private isAgentReady(draft: AgentDraft): boolean {
    return !!(
      draft.name &&
      draft.systemPrompt
    );
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
   * Process message with intelligent trigger inference**
   */
  async processMessage(
    conversationId: string,
    message: string,
    userId: string
  ): Promise<{
    response: string;
    conversationState: ConversationState;
    agentDraft: AgentDraft;
    quickActions: QuickAction[];
    followups?: Array<{ id: string; label: string }>;
    actions?: Array<{ id: string; label: string; variant: string }>;
  }> {
    // Pre-validation (deterministic, before AI processing)
    const preValidation = this.validator.preValidate(message);
    if (!preValidation.valid) {
      throw new AgentBuilderError(
        'INVALID_INPUT',
        preValidation.errors.join(', '),
        'Please check your input and try again.',
        { conversationId, userId, errors: preValidation.errors, warnings: preValidation.warnings }
      );
    }

    // Rate limiting (using Redis directly for service context)
    try {
      const rateLimitKey = `agent_builder:rate_limit:${userId}`;
      const currentCount = await redis.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount, 10) : 0;
      
      if (count >= 20) {
        // Check if we should reset (1 minute window)
        const ttl = await redis.ttl(rateLimitKey);
        if (ttl > 0) {
          throw new AgentBuilderError(
            'RATE_LIMIT_EXCEEDED',
            'Rate limit exceeded',
            `Too many requests. Please wait ${ttl} seconds.`,
            { conversationId, userId, limit: 20, remaining: 0 }
          );
        }
      }

      // Increment counter with 1 minute expiry
      await redis.incr(rateLimitKey);
      await redis.expire(rateLimitKey, 60);
    } catch (error) {
      if (error instanceof AgentBuilderError) {
        throw error;
      }
      // Continue if rate limit check fails (fail open)
      console.warn('[AgentBuilder] Rate limit check failed:', error);
    }

    // Sanitize user input to prevent prompt injection
    const sanitizedMessage = this.inputSanitizer.sanitize(message);

    // Acquire lock to prevent concurrent processing
    const lockAcquired = await this.acquireLock(conversationId);
    if (!lockAcquired) {
      throw new AgentBuilderError(
        'AGENT_BUILDER_CONVERSATION_LOCKED',
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
          'AGENT_BUILDER_CONVERSATION_NOT_FOUND',
          `Conversation ${conversationId} not found`,
          'This conversation could not be found. Please start a new conversation.',
          { conversationId, userId }
        );
      }

      // Verify user owns this conversation
      if (conversationState.userId !== userId) {
        throw new AgentBuilderError(
          'AGENT_BUILDER_UNAUTHORIZED',
          `Unauthorized: Conversation ${conversationId} does not belong to user ${userId}`,
          'You do not have access to this conversation.',
          { conversationId, userId }
        );
      }

      const userContext = await agentBuilderContextService.fetchUserContext(userId);

      // Mark all previous assistant messages' follow-ups as consumed
      try {
        const previousMessages = await prisma.aiMessage.findMany({
          where: {
            conversationId,
            role: 'ASSISTANT',
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        });

        for (const msg of previousMessages) {
          const metadata = (msg.metadata as any) || {};
          if (metadata.followups && !metadata.followupsConsumed) {
            await prisma.aiMessage.update({
              where: { id: msg.id },
              data: {
                metadata: {
                  ...metadata,
                  followupsConsumed: true,
                  followupsConsumedAt: new Date().toISOString(),
                },
              },
            });
          }
        }
      } catch (error) {
        console.error(
          `Failed to mark follow-ups as consumed: ${error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }

      // Add user message to history (use sanitized version)
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
          'AGENT_BUILDER_STATE_REFRESH_FAILED',
          `Failed to refresh conversation state for ${conversationId}`,
          'Failed to load conversation state. Please try again.',
          { conversationId, userId }
        );
      }

      // Try to get cached user context
      let scopedUserContext = await this.responseCache.getCachedUserContext(userId);
      if (!scopedUserContext) {
        scopedUserContext = await this.entityScopeInferrer.inferAndFetchEntityScope(
          message,
          refreshedState.conversationHistory.map(h => ({
            role: h.role,
            content: h.content,
          })),
          userContext,
          userId
        );
        // Cache user context
        await this.responseCache.cacheUserContext(userId, scopedUserContext);
      }

      const enrichedState = await agentBuilderEntityService.enrichMessageWithContext(
        message,
        refreshedState,
        scopedUserContext
      );

      // STEP 1 & 2: Extract configuration and infer automations in parallel
      // These operations are independent and can run concurrently
      const cacheKey = this.responseCache.generateCacheKey(sanitizedMessage, scopedUserContext);
      let extractedConfig: ExtractedConfiguration | null = await this.responseCache.getCachedResponse<ExtractedConfiguration>(cacheKey);
      
      // Start automation inference in parallel (it uses current draft, not extracted config)
      const automationInferencePromise = this.automationInferrer.infer(
        enrichedState.conversationHistory.map(h => ({
          role: h.role,
          content: h.content,
        })),
        sanitizedMessage,
        enrichedState.agentDraft, // Use current draft, not updated one
        scopedUserContext,
        userId
      );

      // Extract configuration (with caching)
      if (!extractedConfig) {
        try {
          extractedConfig = await this.configurationExtractor.extract(
            sanitizedMessage,
            enrichedState,
            scopedUserContext,
            userId,
            conversationId
          );
          // Cache extracted configuration
          if (extractedConfig && extractedConfig.confidenceScore !== undefined) {
            await this.responseCache.cacheExtractedConfiguration(cacheKey, extractedConfig);
          }
        } catch (error) {
          console.error('[AgentBuilder] Configuration extraction failed:', error);
          extractedConfig = { confidenceScore: 0 };
        }
      }

      // Ensure we have a valid config (fallback to empty if needed)
      if (!extractedConfig) {
        extractedConfig = { confidenceScore: 0 };
      }

      // Wait for automation inference (running in parallel)
      const automationInference = await automationInferencePromise;

      // Merge extracted configuration into draft
      const updatedDraft = this.configurationMerger.mergeConfiguration(
        enrichedState.agentDraft,
        extractedConfig
      );

      updatedDraft.metadata = {
        ...(updatedDraft.metadata || {}),
        inferredAutomations: automationInference.automations,
        automationInferenceReasoning: automationInference.reasoning,
      };

      // STEP 3: Determine stage progression
      const { nextStage, reasoning } = await this.stageOrchestrator.determineStageProgression(
        enrichedState.stage,
        updatedDraft,
        enrichedState.conversationHistory.map(h => ({
          role: h.role,
          content: h.content,
        })),
        message,
        extractedConfig,
        userId
      );

      console.log(
        `[AgentBuilder] Stage progression: ${enrichedState.stage} -> ${nextStage} (${reasoning})`
      );

      enrichedState.stage = nextStage;
      enrichedState.agentDraft = updatedDraft;

      let readinessAssessment: StageReadinessAssessment | null = null;
      if (nextStage === 'finalization' || nextStage === 'launch') {
        readinessAssessment = await this.stageOrchestrator.assessStageReadiness(
          nextStage,
          updatedDraft,
          userId
        );
      }

      const enrichedPrompt = agentBuilderPromptService.buildBuilderPrompt(
        enrichedState,
        scopedUserContext,
        sanitizedMessage
      );

      const agentTriggerContext =
        (updatedDraft.triggers?.length || 0) > 0
          ? `**AGENT TRIGGERS CONFIGURED**:\n${(updatedDraft.triggers || [])
            .map(
              t =>
                `- ${t.name || 'Unnamed'} (${t.triggerType}): ${t.reasoning || 'No reasoning'} [Confidence: ${t.confidence || 0}%]`
            )
            .join('\n')}`
          : 'AGENT TRIGGERS: Using defaults (ASSIGN_TASK, DIRECT_MESSAGE, MENTION)';

      const automationContext =
        automationInference.automations.length > 0
          ? `**INFERRED AUTOMATIONS**:\n${automationInference.automations
            .map(
              a =>
                `- ${a.name}: ${a.reasoning} [Confidence: ${a.confidence}%]`
            )
            .join('\n')}\nAUTOMATION REASONING: ${automationInference.reasoning}`
          : 'AUTOMATIONS: None inferred yet';

      // Compress conversation history for final response generation
      const historyForResponse = enrichedState.conversationHistory.map(h => ({
        role: h.role,
        content: h.content,
      }));
      const compressedHistoryForResponse = await this.tokenBudgetManager.compressIfNeeded(
        historyForResponse,
        this.tokenBudgetManager.getBudget('response') * 0.4 // Use 40% of budget for history
      );

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> =
        [
          {
            role: 'system',
            content: `Xovira Agent Builder AI.

Stage: ${nextStage.toUpperCase().replace(/_/g, ' ')}
Decision: ${reasoning}
Readiness: ${
    readinessAssessment
      ? `${readinessAssessment.completionPercentage}% (ready: ${readinessAssessment.isReady ? 'yes' : 'no'})`
      : 'Not evaluated'
  }

${agentTriggerContext}
${automationContext}

${this.QUALITY_GUARDRAILS}
${enrichedPrompt}`,
          },
        ];

      // Add compressed history (only user and assistant messages)
      for (const msg of compressedHistoryForResponse) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
        }
      }

      const model = await fetchModel();

      // Use token budget manager for more accurate estimation
      const estimatedTokens = this.tokenBudgetManager.estimateTokens(JSON.stringify(messages)) + 1500;
      const budgetCheck = await this.tokenBudgetManager.checkBudget('response', estimatedTokens);
      const tokenCheck = await checkAgentTokenLimit(userId, estimatedTokens);

      if (!tokenCheck.allowed || !budgetCheck.allowed) {
        throw new AgentBuilderError(
          'AGENT_BUILDER_INSUFFICIENT_TOKENS',
          `Insufficient tokens or budget exceeded: ${tokenCheck.remaining} remaining, need ${estimatedTokens}`,
          `You have ${tokenCheck.remaining} tokens remaining, but need approximately ${estimatedTokens}. ${budgetCheck.recommendation || ''}`,
          { userId, budgetCheck: budgetCheck.recommendation }
        );
      }
      const completion = await this.runCompletionWithResilience(
        {
          model: model.name,
          messages,
          temperature: 0.7,
          max_tokens: 1500,
          tools: [
            {
              type: 'function',
              function: {
                name: 'generate_response_with_followups',
                description: 'Generate response message and follow-up options',
                parameters: {
                  type: 'object',
                  properties: {
                    response: { type: 'string' },
                    followups: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          label: { type: 'string' },
                        },
                        required: ['id', 'label'],
                      },
                    },
                  },
                  required: ['response', 'followups'],
                },
              },
            },
          ],
          tool_choice: { type: 'function', function: { name: 'generate_response_with_followups' } },
        },
        { operation: 'builder_response', conversationId, userId }
      );

      let response = 'I apologize, but I encountered an error processing your message.';
      let followups: Array<{ id: string; label: string }> = [];

      const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.name === 'generate_response_with_followups') {
        try {
          const rawParsed = JSON.parse(toolCall.function.arguments);
          const validated = FollowupResponseSchema.parse(rawParsed);
          response = validated.response || response;
          followups = validated.followups || [];
        } catch (error) {
          console.error('[AgentBuilder] Failed to parse/validate response follow-ups:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            conversationId,
            userId,
            rawArgs: toolCall.function.arguments?.substring(0, 200),
          });
          const textResponse = completion.choices[0]?.message?.content;
          if (textResponse) {
            response = textResponse;
          }
          followups = extractFollowupsFromText(response);
        }
      } else {
        const textResponse = completion.choices[0]?.message?.content;
        if (textResponse) {
          response = textResponse;
        }
        followups = extractFollowupsFromText(response);
      }

      // Secondary QA pass to enforce quality/safety/consistency
      ({ response, followups } = await this.verifyBuilderOutput(response, followups, {
        stage: nextStage,
        readiness: readinessAssessment,
        extractedConfig,
      }));

      await agentBuilderStateService.addMessageToHistory(
        conversationId,
        'assistant',
        response,
        {
          followups,
          stage: nextStage,
          stageReasoning: reasoning,
          extractedConfig,
          automationInference,
          readinessAssessment,
        }
      );

      const updatedState = await agentBuilderStateService.updateConversationState(conversationId, {
        agentDraft: updatedDraft,
        stage: nextStage,
        focusedList: enrichedState.focusedList,
        mentionedUsers: enrichedState.mentionedUsers,
        suggestions: enrichedState.suggestions,
      });

      await this.syncAgentToDatabase(
        conversationId,
        updatedDraft,
        nextStage,
        userId,
        automationInference
      );

      return {
        response,
        conversationState: updatedState,
        agentDraft: updatedDraft,
        quickActions: [],
        followups,
      };
    } finally {
      await this.releaseLock(conversationId);
    }
  }

  /**
   * Sync agent configuration to database
   * Updates existing agent or creates new one
   */
  private async syncAgentToDatabase(
    conversationId: string,
    draft: AgentDraft,
    stage: ConversationStage,
    userId: string,
    automationInference?: {
      automations: InferredAutomation[];
      reasoning: string;
    }
  ): Promise<void> {
    try {
      // Fetch conversation and agent
      const conversation = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
        include: {
          aiAgent: {
            include: {
              triggers: true,
              automations: true,
            },
          },
        },
      });

      if (conversation?.aiAgent) {
        const agent = conversation.aiAgent;

        // Check permissions
        const hasPermission = await this.permissionService.checkAgentPermission(agent.id, userId, 'write');
        if (!hasPermission) {
          throw new AgentBuilderError(
            'PERMISSION_DENIED',
            'You do not have permission to modify this agent',
            'Please contact the agent owner for access.',
            { agentId: agent.id, userId }
          );
        }

        // Safety evaluation
        if (draft.systemPrompt) {
          const promptValidation = await this.promptSandbox.validatePrompt(draft.systemPrompt);
          if (!promptValidation.valid) {
            throw new AgentBuilderError(
              'SAFETY_VIOLATION',
              'System prompt failed safety validation',
              `Safety violations detected: ${promptValidation.errors.join(', ')}`,
              { agentId: agent.id, violations: promptValidation.errors }
            );
          }
          // Use sanitized prompt
          if (promptValidation.sanitized) {
            draft.systemPrompt = promptValidation.sanitized;
          }
        }

        // Policy compliance check (cast draft to match expected type)
        const policyCheck = await this.policyEngine.checkCompliance(draft as any, userId);
        if (!policyCheck.compliant) {
          throw new AgentBuilderError(
            'POLICY_VIOLATION',
            'Agent configuration violates policies',
            `Policy violations: ${policyCheck.violations.join(', ')}`,
            { agentId: agent.id, violations: policyCheck.violations }
          );
        }

        // Capability whitelist validation
        if (draft.agentType && draft.capabilities) {
          const whitelistCheck = this.capabilityWhitelist.validateCapabilities(
            draft.agentType,
            draft.capabilities
          );
          if (!whitelistCheck.valid) {
            throw new AgentBuilderError(
              'INVALID_CAPABILITIES',
              'Invalid capabilities for agent type',
              whitelistCheck.errors.join(', '),
              { agentId: agent.id, errors: whitelistCheck.errors }
            );
          }
        }

        // Store before state for audit
        const beforeState = {
          name: agent.name,
          description: agent.description,
          systemPrompt: agent.systemPrompt,
          capabilities: agent.capabilities,
          constraints: agent.constraints,
        };

        const isReady = this.isAgentReady(draft);
        const shouldActivate = isReady && (stage === 'launch' || draft.status === 'ready');

        let newStatus = agent.status;
        if (agent.status === 'ACTIVE' && stage !== 'launch') newStatus = 'RECONFIGURING';
        else if (agent.status === 'DRAFT' && !isReady) newStatus = 'BUILDING';
        else if (shouldActivate) newStatus = 'ACTIVE';
        else if (isReady) newStatus = 'DRAFT';

        let availableTools = agent.availableTools;

        if (draft.tools?.length) {
          const toolIdentifiers = draft.tools.map(t => t.id || t.name);
          const systemTools = await prisma.systemTool.findMany({
            where: { isActive: true },
          });

          const validToolNames = toolIdentifiers
            .map(id => systemTools.find(t => t.name === id)?.name)
            .filter(Boolean) as string[];

          if (validToolNames.length > 0) {
            availableTools = validToolNames;
          }
        } else {
          const defaultTools = await prisma.systemTool.findMany({
            where: { isActive: true, isDefault: true },
          });
          availableTools = defaultTools.map(t => t.name);
        }

        let systemPrompt = draft.systemPrompt || agent.systemPrompt;

        if (!systemPrompt && (draft.name || draft.description || draft.capabilities?.length)) {
          try {
            const userContext = await agentBuilderContextService.fetchUserContext(userId);
            systemPrompt = await this.promptGenerator.generate(draft, userContext);
            if (systemPrompt?.length > 100) draft.systemPrompt = systemPrompt;
          } catch (err) {
            console.error('[AgentBuilder] Failed to generate system prompt:', err);
            systemPrompt = agent.systemPrompt || 'Agent instructions will be generated.';
          }
        }

        // Create a version snapshot before applying updates
        try {
          await this.versionControl.createVersion(agent.id, draft as AgentDraft, userId);
        } catch (versionError) {
          console.error('[AgentBuilder] Failed to create agent version snapshot:', versionError);
          // Versioning failures should not block core operation, but are logged for investigation
        }

        await prisma.aiAgent.update({
          where: { id: agent.id },
          data: {
            name: draft.name || agent.name,
            description: draft.description || agent.description,
            avatar: draft.avatar || agent.avatar,
            systemPrompt,
            personality: draft.personality || agent.personality,
            capabilities: draft.capabilities || agent.capabilities,
            constraints: draft.constraints || agent.constraints,
            modelId: draft.modelConfig?.modelId || agent.modelId,
            temperature: draft.modelConfig?.temperature ?? agent.temperature,
            maxTokens: draft.modelConfig?.maxTokens ?? agent.maxTokens,
            availableTools,
            status: newStatus,
            isActive: shouldActivate || agent.isActive,
            metadata: {
              ...(agent.metadata as any),
              rules: draft.rules,
              agentTriggers: draft.triggers,
              tools: draft.tools,
              knowledgeBases: draft.knowledgeBases,
              stage,
              agentDraft: draft,
              automationInference,
              lastUpdated: new Date().toISOString(),
            },
          },
        });

        // Update triggers in transaction to ensure atomicity
        if (draft.triggers?.length) {
          // Validate triggers before deletion
          const validTriggers = draft.triggers
            .filter(t => {
              // Enforce confidence threshold
              if ((t.confidence || 0) < 60) {
                console.warn(`[AgentBuilder] Skipping low-confidence trigger: ${t.name} (${t.confidence}%)`);
                return false;
              }
              // Validate trigger type
              if (!Object.values(AgentTriggerType).includes(t.triggerType as AgentTriggerType)) {
                console.warn(`[AgentBuilder] Skipping invalid trigger type: ${t.triggerType}`);
                return false;
              }
              return true;
            })
            .map(trigger => ({
              id: this.generateId(),
              agentId: agent.id,
              triggerType: trigger.triggerType as AgentTriggerType,
              triggerConfig: trigger.config || {},
              name: trigger.name,
              description: trigger.description || trigger.reasoning,
              isActive: true,
              priority: trigger.priority || 0,
              conditions: trigger.conditions || {},
              filters: trigger.filters || {},
              tags: ['inferred', `confidence-${trigger.confidence}`],
              metadata: {
                confidence: trigger.confidence,
                reasoning: trigger.reasoning,
                inferredAt: new Date().toISOString(),
              },
              updatedAt: new Date(),
            }));

          // Use transaction for atomic update
          await prisma.$transaction(async (tx) => {
            await tx.agentTrigger.deleteMany({ where: { agentId: agent.id } });
            if (validTriggers.length > 0) {
              await tx.agentTrigger.createMany({ data: validTriggers });
            }
          });
        }

        // Update automations in transaction
        if (automationInference?.automations?.length) {
          const validAutomations = automationInference.automations
            .filter(a => {
              if (a.confidence < 60) {
                console.warn(`[AgentBuilder] Skipping low-confidence automation: ${a.name} (${a.confidence}%)`);
                return false;
              }
              if (!a.triggers || a.triggers.length === 0) {
                console.warn(`[AgentBuilder] Skipping automation without triggers: ${a.name}`);
                return false;
              }
              return true;
            })
            .map(a => ({
              id: this.generateId(),
              createdBy: userId,
              agentId: agent.id,
              name: a.name,
              description: a.description || a.reasoning,
              triggerType: a.triggers[0].triggerType,
              triggerConfig: a.triggers[0].config,
              conditions: a.conditions,
              actions: a.actions,
              isActive: true,
              isScheduled: a.isScheduled,
              cronExpression: a.cronExpression,
              timezone: a.timezone,
              metadata: {
                confidence: a.confidence,
                reasoning: a.reasoning,
                allTriggers: a.triggers,
                inferredAt: new Date().toISOString(),
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

          // Use transaction for atomic update
          if (validAutomations.length > 0) {
            await prisma.$transaction(async (tx) => {
              // Delete existing automations for this agent (optional - depends on business logic)
              // await tx.automation.deleteMany({ where: { agentId: agent.id } });
              await tx.automation.createMany({ data: validAutomations });
            });
          }
        }

        await prisma.aiConversation.update({
          where: { id: conversationId },
          data: {
            metadata: {
              ...(conversation.metadata as any),
              stage,
              agentDraft: draft,
              automationInference,
              lastUpdated: new Date().toISOString(),
            },
          },
        });

        console.log(
          `[AgentBuilder] Updated agent ${agent.id} | triggers=${draft.triggers?.length || 0}, automations=${automationInference?.automations?.length || 0}`
        );

        // Audit log for update (best-effort, non-blocking on internal errors)
        try {
          await this.auditLogger.logUpdate(
            agent.id,
            beforeState,
            draft,
            { userId }
          );

          if (shouldActivate) {
            await this.auditLogger.logLaunch(agent.id, { userId });
          }
        } catch (auditError) {
          console.error('[AgentBuilder] Failed to write audit log for agent update:', auditError);
        }
      }
    } catch (error) {
      if (error instanceof AgentBuilderError) {
        throw error;
      }

      const errorId = this.generateId();
      console.error('[AgentBuilder] Failed to sync agent to database:', {
        errorId,
        conversationId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new AgentBuilderError(
        'AGENT_BUILDER_SYNC_FAILED',
        'Failed to sync agent configuration to database',
        'We had trouble saving your agent configuration. Please try again. If the problem persists, contact support with your error ID.',
        { conversationId, userId, errorId }
      );
    }
  }

  async updateDraft(
    conversationId: string,
    draft: Partial<AgentDraft>,
    userId: string
  ): Promise<AgentDraft> {
    const conversationState =
      await agentBuilderStateService.getConversationState(conversationId);
    if (!conversationState) {
      throw new AgentBuilderError(
        'AGENT_BUILDER_CONVERSATION_NOT_FOUND',
        `Conversation ${conversationId} not found`,
        'This conversation could not be found. Please start a new conversation.',
        { conversationId, userId }
      );
    }

    if (conversationState.userId !== userId) {
      throw new AgentBuilderError(
        'AGENT_BUILDER_UNAUTHORIZED',
        `Unauthorized: Conversation ${conversationId} does not belong to user ${userId}`,
        'You do not have access to this conversation.',
        { conversationId, userId }
      );
    }

    const updatedDraft = await agentBuilderStateService.saveAgentDraft(conversationId, draft);

    // Sync to database
    await this.syncAgentToDatabase(conversationId, updatedDraft, conversationState.stage, userId);

    return updatedDraft;
  }

  async launchAgent(
    conversationId: string,
    userId: string
  ): Promise<{ agentId: string; agent: any }> {
    const conversationState =
      await agentBuilderStateService.getConversationState(conversationId);
    if (!conversationState) {
      throw new AgentBuilderError(
        'AGENT_BUILDER_CONVERSATION_NOT_FOUND',
        `Conversation ${conversationId} not found`,
        'This conversation could not be found. Please start a new conversation.',
        { conversationId, userId }
      );
    }

    if (conversationState.userId !== userId) {
      throw new AgentBuilderError(
        'AGENT_BUILDER_UNAUTHORIZED',
        `Unauthorized: Conversation ${conversationId} does not belong to user ${userId}`,
        'You do not have access to this conversation.',
        { conversationId, userId }
      );
    }

    const draft = conversationState.agentDraft;

    if (!this.isAgentReady(draft)) {
      throw new AgentBuilderError(
        'AGENT_BUILDER_INCOMPLETE_CONFIG',
        'Agent configuration is incomplete',
        'Agent configuration is incomplete. Please provide at least: name and system prompt. (Triggers are automatically set to defaults)',
        { conversationId, userId, draft }
      );
    }

    // Update draft status to ready
    draft.status = 'ready';

    // Sync to database with active status
    await this.syncAgentToDatabase(conversationId, draft, 'launch', userId);

    // Find the created/updated agent
    const conversation = await prisma.aiConversation.findUnique({
      where: { id: conversationId },
      include: { aiAgent: true },
    });

    if (!conversation?.aiAgent) {
      throw new AgentBuilderError(
        'AGENT_BUILDER_CREATE_FAILED',
        `Failed to create agent for conversation ${conversationId}`,
        'Failed to create agent. Please try again.',
        { conversationId, userId }
      );
    }

    return { agentId: conversation.aiAgent.id, agent: conversation.aiAgent };
  }
}

export const agentBuilderService = new AgentBuilderService();

