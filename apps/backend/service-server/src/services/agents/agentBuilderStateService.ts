/**
 * Agent Builder State Service
 * 
 * Manages conversation state for agent builder using Redis for production-grade storage
 */

import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { UserContext } from './agentBuilderContextService';
import { MessageRole } from '@xovira/database/src/generated/prisma/client';

export type ConversationStage =
  | 'configuration'
  | 'finalization'
  | 'launch';

export interface AgentDraft {
  name?: string;
  description?: string;
  avatar?: string;
  agentType?: string;
  systemPrompt?: string;
  personality?: any;
  capabilities?: string[];
  constraints?: string[];
  modelConfig?: {
    modelId?: string;
    temperature?: number;
    maxTokens?: number;
  };
  knowledgeBases?: Array<any>;
  tools?: Array<{
    id: string;
    name: string;
    config?: any;
  }>;
  rules?: Array<{
    type: string;
    condition: string;
    action: string;
  }>;
  triggers?: Array<{
    triggerType: string;
    name?: string;
    description?: string;
    config: any;
    priority?: number;
    conditions?: any;
    filters?: any;
    confidence?: number;
    reasoning?: string;
  }>;
  metadata?: Record<string, any>;
  status: 'draft' | 'testing' | 'ready';
}

export interface ConversationState {
  conversationId: string;
  userId: string;
  stage: ConversationStage;
  agentDraft: AgentDraft;
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: any;
  }>;
  pendingActions: Array<{
    type: string;
    field?: string;
    service?: string;
    data?: any;
  }>;
  focusedList?: any;
  mentionedUsers?: Array<any>;
  suggestions: Array<{
    type: string;
    value: any;
    label: string;
    reason: string;
  }>;
  configurationHistory?: Array<{
    timestamp: Date;
    field: string;
    oldValue: any;
    newValue: any;
    source: 'user_message' | 'ai_extraction' | 'manual_edit';
  }>;
  completedFields?: string[];
  currentFocus?: string; // Which field/stage AI is currently working on
}

// Redis key prefix for conversation states
const REDIS_KEY_PREFIX = 'agent_builder:conversation';
// TTL for conversation states: 24 hours (in seconds)
const CONVERSATION_TTL = 24 * 60 * 60;

/**
 * Get Redis key for a conversation
 */
function getConversationKey(conversationId: string): string {
  return `${REDIS_KEY_PREFIX}:${conversationId}`;
}

/**
 * Check if Redis is available and ready
 */
async function isRedisReady(): Promise<boolean> {
  try {
    return redis.status === 'ready';
  } catch {
    return false;
  }
}

/**
 * Serialize conversation state for Redis storage
 */
function serializeState(state: ConversationState): string {
  return JSON.stringify({
    ...state,
    conversationHistory: state.conversationHistory.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    })),
    configurationHistory: state.configurationHistory?.map(entry => ({
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    })),
  });
}

/**
 * Deserialize conversation state from Redis
 */
function deserializeState(data: string): ConversationState {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    conversationHistory: parsed.conversationHistory.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    })),
    configurationHistory: parsed.configurationHistory?.map((entry: any) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    })),
  };
}

export class AgentBuilderStateService {
  async createConversationState(
    userId: string,
    agentId?: string
  ): Promise<ConversationState> {

    // Create conversation in database
    const conversation = await prisma.aiConversation.create({
      data: {
        userId,
        conversationType: 'AGENT_BUILDER',
        title: 'Agent Builder Conversation',
        isActive: true,
        ...(agentId && { agentId }), // Link to agent if provided
      },
    });

    const conversationId = conversation.id;

    const state: ConversationState = {
      conversationId,
      userId,
      stage: 'configuration',
      agentDraft: {
        status: 'draft',
      },
      conversationHistory: [],
      pendingActions: [],
      suggestions: [],
      configurationHistory: [],
      completedFields: [],
    };

    // Store in Redis with TTL
    if (await isRedisReady()) {
      try {
        const key = getConversationKey(conversationId);
        await redis.setex(key, CONVERSATION_TTL, serializeState(state));
      } catch (error) {
        console.error(`Failed to store conversation state in Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continue execution - state is stored in database via conversation record
      }
    }

    return state;
  }

  async getConversationState(
    conversationId: string
  ): Promise<ConversationState | null> {
    let state: ConversationState | null = null;

    // Try to load from Redis first
    if (await isRedisReady()) {
      try {
        const key = getConversationKey(conversationId);
        const data = await redis.get(key);

        if (data) {
          state = deserializeState(data);
        }
        console.log(`Retrieved conversation state from Redis for conversation ${conversationId}`);
      } catch (error) {
        console.error(`Failed to retrieve conversation state from Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // If Redis doesn't have it, try to reconstruct from database
    if (!state) {
      try {
        const conversation = await prisma.aiConversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) {
          return null;
        }

        // Load messages from database
        const messages = await prisma.aiMessage.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
        });

        // Reconstruct state from database
        const metadata = (conversation.metadata as any) || {};
        state = {
          conversationId,
          userId: conversation.userId,
          stage: metadata.stage || 'configuration', // Load stage from metadata
          agentDraft: {
            status: 'draft',
            ...metadata.agentDraft,
          },
          conversationHistory: messages.map(msg => ({
            role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
            content: msg.content,
            timestamp: msg.createdAt,
            metadata: msg.metadata as any,
          })),
          pendingActions: metadata.pendingActions || [],
          suggestions: metadata.suggestions || [],
          focusedList: metadata.focusedList,
          mentionedUsers: metadata.mentionedUsers,
          configurationHistory: metadata.configurationHistory || [],
          completedFields: metadata.completedFields || [],
          currentFocus: metadata.currentFocus,
        };

        // Store reconstructed state in Redis
        if (await isRedisReady()) {
          try {
            const key = getConversationKey(conversationId);
            await redis.setex(key, CONVERSATION_TTL, serializeState(state));
          } catch (error) {
            console.error('Failed to store reconstructed state in Redis:', error);
          }
        }
      } catch (error) {
        console.error(`Failed to reconstruct conversation state from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
      }
    } else {
      // If we have Redis state, sync conversation history from database to ensure we have all messages
      try {
        const dbMessages = await prisma.aiMessage.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
        });

        // Merge database messages with Redis state
        // Database is source of truth for messages
        state.conversationHistory = dbMessages.map(msg => ({
          role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: msg.createdAt,
          metadata: msg.metadata as any,
        }));

        // Update Redis with synced state
        if (await isRedisReady()) {
          try {
            const key = getConversationKey(conversationId);
            await redis.setex(key, CONVERSATION_TTL, serializeState(state));
          } catch (error) {
            console.error('Failed to update synced state in Redis:', error);
          }
        }
      } catch (error) {
        console.error('Failed to sync conversation history from database:', error);
        // Continue with Redis state if database sync fails
      }
    }

    return state;
  }

  async updateConversationState(
    conversationId: string,
    updates: Partial<ConversationState>
  ): Promise<ConversationState> {
    const state = await this.getConversationState(conversationId);
    if (!state) {
      throw new Error('Conversation state not found');
    }

    const updated = {
      ...state,
      ...updates,
      agentDraft: {
        ...state.agentDraft,
        ...(updates.agentDraft || {}),
      },
    };

    // Update in Redis
    if (await isRedisReady()) {
      try {
        const key = getConversationKey(conversationId);
        await redis.setex(key, CONVERSATION_TTL, serializeState(updated));
      } catch (error) {
        console.error(`Failed to update conversation state in Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw new Error('Failed to update conversation state');
      }
    }

    // Persist critical state to database metadata for recovery
    try {
      const conversation = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
      });

      if (conversation) {
        const conversationWithMetadata = conversation as any;
        const existingMetadata = (conversationWithMetadata.metadata || {}) as any;
        await (prisma.aiConversation.update as any)({
          where: { id: conversationId },
          data: {
            metadata: JSON.parse(JSON.stringify({
              ...existingMetadata,
              stage: updated.stage,
              agentDraft: updated.agentDraft,
              pendingActions: updated.pendingActions,
              suggestions: updated.suggestions,
              focusedList: updated.focusedList,
              mentionedUsers: updated.mentionedUsers,
              configurationHistory: updated.configurationHistory,
              completedFields: updated.completedFields,
              currentFocus: updated.currentFocus,
            })),
          },
        });
      }
    } catch (error) {
      console.error(`Failed to persist conversation state to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw - Redis is primary, DB is backup
    }

    return updated;
  }

  async addMessageToHistory(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ): Promise<void> {
    const state = await this.getConversationState(conversationId);
    if (!state) {
      throw new Error('Conversation state not found');
    }

    // Add message to history
    state.conversationHistory.push({
      role,
      content,
      timestamp: new Date(),
      metadata,
    });

    // Keep only last 50 messages in memory for LLM context
    if (state.conversationHistory.length > 50) {
      state.conversationHistory = state.conversationHistory.slice(-50);
    }

    // Update in Redis
    if (await isRedisReady()) {
      try {
        const key = getConversationKey(conversationId);
        await redis.setex(key, CONVERSATION_TTL, serializeState(state));
      } catch (error) {
        console.error(`Failed to update conversation history in Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continue - will try to store in database
      }
    }

    // Store in database for persistence
    try {
      const savedMessage = await prisma.aiMessage.create({
        data: {
          conversationId,
          role: role.toUpperCase() as MessageRole,
          content,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        },
      });
      console.log(`Message saved to database: ${savedMessage.id} for conversation ${conversationId}`);
    } catch (error) {
      console.error(`Failed to store message in database for conversation ${conversationId}:`, error);
      // Don't throw - Redis storage is primary, database is backup
      // But log the error for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          conversationId,
          role,
          contentLength: content.length,
        });
      }
    }
  }

  async saveAgentDraft(
    conversationId: string,
    draft: Partial<AgentDraft>
  ): Promise<AgentDraft> {
    const state = await this.getConversationState(conversationId);
    if (!state) {
      throw new Error('Conversation state not found');
    }

    state.agentDraft = {
      ...state.agentDraft,
      ...draft,
    };

    // Update in Redis
    if (await isRedisReady()) {
      try {
        const key = getConversationKey(conversationId);
        await redis.setex(key, CONVERSATION_TTL, serializeState(state));
      } catch (error) {
        console.error(`Failed to save agent draft in Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw new Error('Failed to save agent draft');
      }
    }

    return state.agentDraft;
  }

  async updateStage(
    conversationId: string,
    stage: ConversationStage
  ): Promise<void> {
    await this.updateConversationState(conversationId, { stage });
  }

  async addSuggestion(
    conversationId: string,
    suggestion: {
      type: string;
      value: any;
      label: string;
      reason: string;
    }
  ): Promise<void> {
    const state = await this.getConversationState(conversationId);
    if (!state) {
      throw new Error('Conversation state not found');
    }

    state.suggestions.push(suggestion);

    // Update in Redis
    if (await isRedisReady()) {
      try {
        const key = getConversationKey(conversationId);
        await redis.setex(key, CONVERSATION_TTL, serializeState(state));
      } catch (error) {
        console.error(`Failed to add suggestion in Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw new Error('Failed to add suggestion');
      }
    }
  }

  async clearSuggestions(conversationId: string): Promise<void> {
    const state = await this.getConversationState(conversationId);
    if (!state) {
      throw new Error('Conversation state not found');
    }

    state.suggestions = [];

    // Update in Redis
    if (await isRedisReady()) {
      try {
        const key = getConversationKey(conversationId);
        await redis.setex(key, CONVERSATION_TTL, serializeState(state));
      } catch (error) {
        console.error(`Failed to clear suggestions in Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw new Error('Failed to clear suggestions');
      }
    }
  }

  async setFocusedList(conversationId: string, list: any): Promise<void> {
    await this.updateConversationState(conversationId, { focusedList: list });
  }

  async setMentionedUsers(conversationId: string, users: Array<any>): Promise<void> {
    await this.updateConversationState(conversationId, { mentionedUsers: users });
  }

  async deleteConversationState(conversationId: string): Promise<void> {
    if (await isRedisReady()) {
      try {
        const key = getConversationKey(conversationId);
        await redis.del(key);
      } catch (error) {
        console.error(`Failed to delete conversation state from Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Don't throw - deletion is best effort
      }
    }
  }

  /**
   * Extend TTL for a conversation state
   */
  async extendConversationTTL(conversationId: string, ttlSeconds: number = CONVERSATION_TTL): Promise<void> {
    if (await isRedisReady()) {
      try {
        const key = getConversationKey(conversationId);
        const exists = await redis.exists(key);
        if (exists) {
          await redis.expire(key, ttlSeconds);
        }
      } catch (error) {
        console.error(`Failed to extend conversation TTL in Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Get all conversation IDs for a user (for cleanup or listing)
   */
  async getUserConversationIds(userId: string): Promise<string[]> {
    if (!(await isRedisReady())) {
      return [];
    }

    try {
      const pattern = `${REDIS_KEY_PREFIX}:*`;
      const keys: string[] = [];
      let cursor = '0';

      do {
        const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = result[0];
        keys.push(...result[1]);
      } while (cursor !== '0');

      // Filter by userId by checking each key
      const userConversations: string[] = [];
      for (const key of keys) {
        try {
          const data = await redis.get(key);
          if (data) {
            const state = deserializeState(data);
            if (state.userId === userId) {
              const conversationId = key.replace(`${REDIS_KEY_PREFIX}:`, '');
              userConversations.push(conversationId);
            }
          }
        } catch {
          // Skip invalid entries
          continue;
        }
      }

      return userConversations;
    } catch (error) {
      console.error(`Failed to get user conversation IDs from Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
}

export const agentBuilderStateService = new AgentBuilderStateService();

