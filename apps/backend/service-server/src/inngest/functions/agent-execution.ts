import { inngest } from '@/lib/inngest';
import { executeAgentLogic } from '@/services/agents/agentExecutionService';

export const executeAgent = inngest.createFunction(
  {
    id: 'execute-agent',
    name: 'Execute AI Agent',
    retries: 3
  },
  { event: 'agent/execute' },
  async ({ event, step }) => {
    const { executionId, agentId, userId, inputData, executionContext } = event.data;

    // Step 1: Validate and fetch agent
    const { agent } = await step.run('validate-agent', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      const agent = await prisma.aiAgent.findUnique({
        where: { id: agentId },
        include: {
          aiModel: true,
          tools: {
            where: { isActive: true },
          },
        },
      });

      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      if (!agent.isActive) {
        throw new Error(`Agent ${agentId} is not active`);
      }

      // Verify user access
      const hasAccess = agent.createdBy === userId || 
        await prisma.agentCollaborator.findFirst({
          where: {
            agentId,
            userId,
            canExecute: true,
          },
        }) !== null;

      if (!hasAccess) {
        throw new Error('Access denied');
      }

      return { agent };
    });

    // Step 2: Update execution status to RUNNING and agent status to EXECUTING
    await step.run('update-status-running', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      await Promise.all([
        prisma.agentExecution.update({
          where: { id: executionId },
          data: {
            status: 'RUNNING',
          },
        }),
        prisma.aiAgent.update({
          where: { id: agentId },
          data: {
            status: 'EXECUTING',
          },
        }),
      ]);
    });

    // Step 3: Execute agent logic
    const result = await step.run('execute-agent-logic', async () => {
      return executeAgentLogic({
        executionId,
        agentId,
        userId,
        inputData,
        executionContext,
      });
    });

    // Step 4: Handle result and reset agent status to ACTIVE
    await step.run('handle-result', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      if (result.success) {
        // Already handled in executeAgentLogic, but ensure consistency
        await Promise.all([
          prisma.agentExecution.update({
            where: { id: executionId },
            data: {
              status: 'COMPLETED',
              result: result.output,
            },
          }),
          prisma.aiAgent.update({
            where: { id: agentId },
            data: {
              status: 'ACTIVE',
              lastExecutedAt: new Date(),
            },
          }),
        ]);
      } else {
        await Promise.all([
          prisma.agentExecution.update({
            where: { id: executionId },
            data: {
              status: 'FAILED',
              error: result.error,
            },
          }),
          prisma.aiAgent.update({
            where: { id: agentId },
            data: {
              status: 'ACTIVE',
            },
          }),
        ]);
      }
    });

    return {
      success: result.success,
      executionId,
      result: result.output,
      error: result.error,
    };
  }
);

