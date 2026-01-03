import { Injectable } from '@nestjs/common';
import { prisma } from '@/lib/prisma';
import { createAgentGraph } from './agentGraph';

export interface ExecuteChatParams {
  userId: string;
  agentId?: string;
  message: string;
  conversationId?: string;
  workspaceId?: string;
  context?: any;
}

export interface AgentExecutionResult {
  status: 'COMPLETED' | 'FAILED';
  response?: string;
  intent?: any;
  plan?: any;
  approvalRequest?: any;
  error?: string;
}

@Injectable()
export class AgentExecutionService {
  /**
   * Execute agent chat interaction
   */
  async executeChat(params: ExecuteChatParams): Promise<AgentExecutionResult> {
    try {
      // Get agent configuration if agentId is provided
      let agent = null;
      if (params.agentId) {
        agent = await prisma.aiAgent.findUnique({
          where: { id: params.agentId },
        });

        if (!agent || !agent.isActive || agent.status !== 'ACTIVE') {
          throw new Error('Agent not found or not active');
        }
      }

      // Create execution record
      const execution = await (prisma as any).agentExecution.create({
        data: {
          agentId: params.agentId || 'chat-agent',
          triggeredBy: 'MANUAL',
          triggerUserId: params.userId,
          inputData: { message: params.message, context: params.context },
          status: 'QUEUED',
          startedAt: new Date(),
        },
      });

      try {
        // Create and invoke agent graph
        const graph = createAgentGraph();
        const initialState = {
          userId: params.userId,
          agentId: params.agentId,
          message: params.message,
          conversationId: params.conversationId,
          workspaceId: params.workspaceId || agent?.workspaceId,
          status: 'PENDING' as const,
        };

        const result = await graph.invoke(initialState);

        // Update execution with result
        await (prisma as any).agentExecution.update({
          where: { id: execution.id },
          data: {
            status: result.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
            outputData: result,
            completedAt: new Date(),
            reasoning: result.intent ? [result.intent] : [],
            errorMessage: result.status === 'FAILED' ? 'Execution failed' : null,
          },
        });

        return {
          status: result.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
          response: result.response,
          intent: result.intent,
          plan: result.plan,
          approvalRequest: result.approvalRequest,
        };
      } catch (error) {
        // Update execution with error
        await (prisma as any).agentExecution.update({
          where: { id: execution.id },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        throw error;
      }
    } catch (error) {
      return {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute agent with specific configuration
   */
  async executeAgent(params: {
    agentId: string;
    userId: string;
    inputData?: any;
    executionContext?: any;
  }): Promise<AgentExecutionResult> {
    const agent = await prisma.aiAgent.findUnique({
      where: { id: params.agentId },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    if (!agent.isActive || agent.status !== 'ACTIVE') {
      throw new Error('Agent is not active');
    }

    return this.executeChat({
      userId: params.userId,
      agentId: params.agentId,
      message: (params.inputData as any)?.message || 'Execute agent',
      workspaceId: agent.workspaceId,
      context: params.executionContext,
    });
  }
}

/**
 * Execute agent logic - used by Inngest functions
 */
export async function executeAgentLogic(params: {
  executionId: string;
  agentId: string;
  userId: string;
  inputData?: any;
  executionContext?: any;
}): Promise<{ success: boolean; output?: any; error?: string }> {
  const service = new AgentExecutionService();
  
  try {
    const result = await service.executeAgent({
      agentId: params.agentId,
      userId: params.userId,
      inputData: params.inputData,
      executionContext: params.executionContext,
    });

    return {
      success: result.status === 'COMPLETED',
      output: result,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}