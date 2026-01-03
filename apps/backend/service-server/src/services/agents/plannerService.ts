/**
 * Planner Service
 * 
 * Generates execution plans from intents and context
 * Plans consist of steps, not direct API calls
 */

import { Intent, ExecutionPlan, ExecutionStep, Context } from './types';
import { openai } from '@/lib/openai';
import {
  checkAgentTokenLimit,
  updateAgentUsage,
  estimateTokens,
  countAgentTokens,
} from '@/utils/ai/agentUsageTracking';
import { prisma } from '@/lib/prisma';
import { fetchModel } from '@/utils/ai/fetchModel';

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          order: { type: 'number' },
          description: { type: 'string' },
          type: {
            type: 'string',
            enum: ['GATHER_CONTEXT', 'VALIDATE', 'EXECUTE', 'CONFIRM', 'STORE_MEMORY'],
          },
          dependencies: {
            type: 'array',
            items: { type: 'string' },
          },
          estimatedTime: { type: 'number' },
          tool: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              parameters: { type: 'object' },
            },
          },
        },
        required: ['id', 'order', 'description', 'type', 'dependencies', 'estimatedTime'],
      },
    },
    totalEstimatedTime: { type: 'number' },
    requiresApproval: { type: 'boolean' },
    approvalReason: { type: 'string' },
  },
  required: ['steps', 'totalEstimatedTime', 'requiresApproval'],
};

export async function generatePlan(
  intent: Intent,
  context: Context[],
  availableTools: string[],
  userId?: string
): Promise<ExecutionPlan> {
  const systemPrompt = `You are a planning system for an AI agent. Your job is to break down user intents into executable steps.

Planning rules:
1. Always start with GATHER_CONTEXT if context is incomplete
2. Always VALIDATE before EXECUTE
3. STORE_MEMORY after successful execution
4. Request approval for bulk actions (>5 items) or destructive actions
5. Steps should be atomic and well-defined
6. Dependencies must reference step IDs
7. Estimated time should be in milliseconds

Available tools: ${availableTools.join(', ')}

Context available:
${context.map((c) => `- ${c.type}: ${c.content.substring(0, 100)}...`).join('\n')}

Generate a detailed execution plan.`;

  const userPrompt = `Intent: ${intent.action}
Parameters: ${JSON.stringify(intent.parameters, null, 2)}
Reasoning: ${intent.reasoning || 'N/A'}

Generate an execution plan for this intent.`;

  try {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];
    
    const model = await fetchModel();
    
    // Estimate tokens and check limit if userId provided
    if (userId) {
      const estimatedTokens = estimateTokens(JSON.stringify(messages)) + 2000; // Add buffer for response
      const tokenCheck = await checkAgentTokenLimit(userId, estimatedTokens);
      if (!tokenCheck.allowed) {
        throw new Error(
          `Insufficient tokens. You have ${tokenCheck.remaining} tokens remaining, but need approximately ${estimatedTokens} tokens. Please upgrade your plan or purchase more tokens.`
        );
      }
    }
    
    const response = await openai.chat.completions.create({
      model: model.name,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'execution_plan', schema: PLAN_SCHEMA as any },
      },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Track usage if userId provided
    if (userId) {
      countAgentTokens(
        messages as Array<{ role: string; content: string }>,
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
          console.error('Failed to update agent usage for plan generation:', error);
        }
      }).catch(() => {
        // Ignore errors for background tracking
      });
    }

    const planData = JSON.parse(content);
    
    // Generate unique IDs for steps if not provided
    const steps: ExecutionStep[] = planData.steps.map((step: any, index: number) => ({
      id: step.id || `step_${index + 1}`,
      order: step.order ?? index + 1,
      description: step.description,
      type: step.type,
      dependencies: step.dependencies || [],
      estimatedTime: step.estimatedTime || 1000,
      tool: step.tool,
      status: 'PENDING' as const,
    }));

    const plan: ExecutionPlan = {
      id: `plan_${Date.now()}`,
      steps,
      totalEstimatedTime: planData.totalEstimatedTime || steps.reduce((sum, s) => sum + s.estimatedTime, 0),
      requiresApproval: planData.requiresApproval || false,
      approvalReason: planData.approvalReason,
      contextUsed: context.map((c) => ({
        contextId: c.id,
        usedIn: 'planning',
        relevanceScore: c.metadata.relevanceScore,
        explanation: `Used ${c.type} context: ${c.content.substring(0, 50)}...`,
      })),
      createdAt: new Date().toISOString(),
    };

    return plan;
  } catch (error) {
    console.error('Error generating plan:', error);
    
    // Fallback: return a simple plan
    return {
      id: `plan_${Date.now()}`,
      steps: [
        {
          id: 'step_1',
          order: 1,
          description: 'Process the request',
          type: 'EXECUTE',
          dependencies: [],
          estimatedTime: 5000,
          status: 'PENDING',
        },
      ],
      totalEstimatedTime: 5000,
      requiresApproval: false,
      contextUsed: [],
      createdAt: new Date().toISOString(),
    };
  }
}


