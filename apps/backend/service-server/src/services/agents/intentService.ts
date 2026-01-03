/**
 * Intent Understanding Service
 * 
 * Converts natural language messages into structured intent JSON
 */

import { Intent } from './types';
import { openai } from '@/lib/openai';
import {
  checkAgentTokenLimit,
  updateAgentUsage,
  estimateTokens,
  countAgentTokens,
} from '@/utils/ai/agentUsageTracking';
import { prisma } from '@/lib/prisma';
import { fetchModel } from '@/utils/ai/fetchModel';

const INTENT_SCHEMA = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['CREATE_AGENT', 'UPDATE_AGENT', 'EXECUTE_TASK', 'PLAN_WORKFLOW', 'CLARIFY'],
      description: 'The primary action the user wants to perform',
    },
    parameters: {
      type: 'object',
      properties: {
        // Agent creation parameters
        name: { type: 'string', description: 'Agent name' },
        description: { type: 'string', description: 'Agent description' },
        systemPrompt: { type: 'string', description: 'System prompt/instructions for the agent' },
        tools: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of tool IDs the agent can use',
        },
        context: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['project', 'team', 'workspace', 'task', 'document'],
              },
              id: { type: 'string' },
            },
          },
          description: 'Context items to provide to the agent',
        },
        autonomyLevel: {
          type: 'string',
          enum: ['FULL', 'SEMI_AUTONOMOUS', 'MANUAL'],
          description: 'Level of autonomy for the agent',
        },
        requiresApproval: {
          type: 'boolean',
          description: 'Whether agent requires approval before executing actions',
        },
        // Task execution parameters
        taskAction: {
          type: 'string',
          enum: ['CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'LIST'],
          description: 'Task action to perform',
        },
        taskParams: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            assigneeId: { type: 'string' },
            dueDate: { type: 'string' },
            projectId: { type: 'string' },
            teamId: { type: 'string' },
            workspaceId: { type: 'string' },
            priority: {
              type: 'string',
              enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
            },
            status: { type: 'string' },
          },
        },
        bulkCount: {
          type: 'number',
          description: 'Number of items in bulk operation',
        },
        agentId: {
          type: 'string',
          description: 'Agent ID for updates or execution',
        },
      },
    },
    confidence: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'Confidence score for this intent classification',
    },
    requiresClarification: {
      type: 'boolean',
      description: 'Whether clarification is needed from the user',
    },
    clarificationQuestions: {
      type: 'array',
      items: { type: 'string' },
      description: 'Questions to ask the user for clarification',
    },
    reasoning: {
      type: 'string',
      description: 'Explanation of why this intent was chosen',
    },
  },
  required: ['action', 'parameters', 'confidence', 'requiresClarification'],
};

export async function understandIntent(
  message: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  workspaceContext?: {
    projects?: Array<{ id: string; name: string }>;
    teams?: Array<{ id: string; name: string }>;
    tasks?: Array<{ id: string; title: string }>;
  },
  userId?: string
): Promise<Intent> {
  const systemPrompt = `You are an intent understanding system for an AI agent creation platform. Your job is to analyze user messages and extract structured intent information.

Available actions:
- CREATE_AGENT: User wants to create a new AI agent
- UPDATE_AGENT: User wants to modify an existing agent
- EXECUTE_TASK: User wants to perform task management actions
- PLAN_WORKFLOW: User wants to plan a multi-step workflow
- CLARIFY: Need more information from user

Workspace context:
${workspaceContext ? JSON.stringify(workspaceContext, null, 2) : 'No workspace context available'}

Analyze the user's message and extract the intent with all relevant parameters. Be thorough and extract all mentioned details.`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })),
    { role: 'user', content: message },
  ];

  try {
    // Estimate tokens and check limit if userId provided
    if (userId) {
      const estimatedTokens = estimateTokens(JSON.stringify(messages)) + 1000; // Add buffer for response
      const tokenCheck = await checkAgentTokenLimit(userId, estimatedTokens);
      if (!tokenCheck.allowed) {
        throw new Error(
          `Insufficient tokens. You have ${tokenCheck.remaining} tokens remaining, but need approximately ${estimatedTokens} tokens. Please upgrade your plan or purchase more tokens.`
        );
      }
    }
    
    const model = await fetchModel();

    const response = await openai.chat.completions.create({
      model: model.name,
      messages,
      response_format: { type: 'json_schema', json_schema: { name: 'intent', schema: INTENT_SCHEMA as any } },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Track usage if userId provided
    if (userId) {
      countAgentTokens(
        messages.map(m => ({ role: m.role, content: m.content })),
        content,
        'gpt-4o-mini'
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
          console.error('Failed to update agent usage for intent understanding:', error);
        }
      }).catch(() => {
        // Ignore errors for background tracking
      });
    }

    const intent = JSON.parse(content) as Intent;
    
    // Validate intent structure
    if (!intent.action || !intent.parameters || typeof intent.confidence !== 'number') {
      throw new Error('Invalid intent structure returned from OpenAI');
    }

    return intent;
  } catch (error) {
    console.error('Error understanding intent:', error);
    
    // Fallback: return a CLARIFY intent
    return {
      action: 'CLARIFY',
      parameters: {},
      confidence: 0.5,
      requiresClarification: true,
      clarificationQuestions: [
        "I'm having trouble understanding your request. Could you please rephrase it or provide more details?",
      ],
      reasoning: `Error occurred during intent understanding: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}


