/**
 * Agent Chat Service
 * 
 * Handles chat interactions with live agents
 */

import { openai } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { agentBuilderContextService, UserContext } from './agentBuilderContextService';
import { createAgentGraph } from './agentGraph';

export interface AgentChatContext {
  agent: any;
  conversation: any;
  workspaceContext: UserContext;
  recentInteractions: Array<{
    timestamp: Date;
    userMessage: string;
    agentResponse: string;
    actionsTaken: Array<any>;
  }>;
  activeTasks: Array<any>;
  relatedEntities: {
    projects?: Array<any>;
    tasks?: Array<any>;
    teamMembers?: Array<any>;
  };
}

export class AgentChatService {
  async processAgentChatMessage(
    agentId: string,
    conversationId: string | undefined,
    userId: string,
    message: string,
    workspaceId: string | undefined
  ): Promise<{
    response: string;
    actions?: Array<{
      type: string;
      tool: string;
      parameters: any;
      result?: any;
    }>;
    intent?: {
      action: string;
      parameters: any;
    };
    requiresApproval?: boolean;
    approvalRequest?: any;
    suggestions?: Array<{
      label: string;
      action: string;
      description?: string;
    }>;
  }> {
    // Get agent
    const agent = await prisma.aiAgent.findFirst({
      where: {
        id: agentId,
        OR: [
          { createdBy: userId },
          {
            collaborators: {
              some: { userId, canExecute: true },
            },
          },
        ],
      },
    });

    if (!agent) {
      throw new Error('Agent not found or access denied');
    }

    if (!agent.isActive && agent.status !== 'DRAFT') {
      throw new Error('Agent is not active');
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.aiConversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: {
          userId,
          workspaceId: workspaceId || agent.workspaceId,
          conversationType: 'AGENT',
          title: `Chat with ${agent.name}`,
          modelId: agent.modelId,
        },
      });
    }

    // Get workspace context
    const workspaceContext = await agentBuilderContextService.fetchUserContext(
      userId,
      workspaceId || agent.workspaceId
    );

    // Get chat context
    const chatContext = await this.buildChatContext(
      agent,
      conversation,
      workspaceContext,
      userId
    );

    // Use agent graph for execution
    const graph = createAgentGraph();
    const initialState = {
      userId,
      agentId,
      message,
      conversationId: conversation.id,
      workspaceId: workspaceId || agent.workspaceId,
      status: 'PENDING' as const,
    };

    const result = await graph.invoke(initialState as any);

    // Save message to conversation
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      },
    });

    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: result.response || 'Processing complete',
      },
    });

    // Generate suggestions
    const suggestions = this.generateContextualSuggestions(
      agent,
      workspaceContext,
      []
    );

    return {
      response: result.response || 'Processing complete',
      actions: result.executionResults?.map((r: any) => ({
        type: r.type,
        tool: r.tool,
        parameters: r.parameters,
        result: r.result,
      })),
      intent: result.intent,
      requiresApproval: result.plan?.requiresApproval || false,
      approvalRequest: result.approvalRequest,
      suggestions,
    };
  }

  async getWelcomeMessage(agentId: string, userId: string): Promise<string> {
    const agent = await prisma.aiAgent.findFirst({
      where: {
        id: agentId,
        OR: [
          { createdBy: userId },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
    });

    if (!agent) {
      throw new Error('Agent not found or access denied');
    }

    const workspaceContext = await agentBuilderContextService.fetchUserContext(
      userId,
      agent.workspaceId
    );

    return this.generateRoleAwareWelcomeMessage(agent, workspaceContext);
  }

  async getChatContext(agentId: string, userId: string): Promise<AgentChatContext> {
    const agent = await prisma.aiAgent.findFirst({
      where: {
        id: agentId,
        OR: [
          { createdBy: userId },
          {
            collaborators: {
              some: { userId },
            },
          },
        ],
      },
    });

    if (!agent) {
      throw new Error('Agent not found or access denied');
    }

    const workspaceContext = await agentBuilderContextService.fetchUserContext(
      userId,
      agent.workspaceId
    );

    // Get recent interactions
    const recentExecutions = await prisma.agentExecution.findMany({
      where: {
        agentId,
        triggerUserId: userId,
      },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    const recentInteractions = recentExecutions.map((exec) => ({
      timestamp: exec.startedAt,
      userMessage: (exec.inputData as any)?.message || 'Triggered execution',
      agentResponse: (exec.outputData as any)?.response || 'Completed',
      actionsTaken: [],
    }));

    return {
      agent,
      conversation: null,
      workspaceContext,
      recentInteractions,
      activeTasks: [],
      relatedEntities: {
        projects: [],
        tasks: [],
        teamMembers: workspaceContext.teamMembers,
      },
    };
  }

  private async buildChatContext(
    agent: any,
    conversation: any,
    workspaceContext: UserContext,
    userId: string
  ): Promise<AgentChatContext> {
    return {
      agent,
      conversation,
      workspaceContext,
      recentInteractions: [],
      activeTasks: [],
      relatedEntities: {
        teamMembers: workspaceContext.teamMembers,
      },
    };
  }

  private generateRoleAwareWelcomeMessage(
    agent: any,
    workspaceContext: UserContext
  ): string {
    let welcome = `Hi there! Thanks for setting me up.\n\n`;
    welcome += `I'm ${agent.name}. `;

    // Describe role based on agent type and configuration
    if (agent.triggerType) {
      const triggerDesc = this.describeTrigger(agent.triggerType, agent.triggerConfig);
      welcome += triggerDesc;
    } else {
      welcome += `I'm ready to help you with your tasks.`;
    }

    // Describe capabilities
    if (agent.capabilities && agent.capabilities.length > 0) {
      welcome += `\n\nI can help you with:\n`;
      agent.capabilities.forEach((cap: string) => {
        welcome += `- ${cap}\n`;
      });
    }

    // Explain how to work with agent
    welcome += `\n\nYou can work with me by:\n`;

    if (agent.triggerType === 'TASK_CREATED') {
      welcome += `- Creating tasks in the specified lists (I'll auto-process them)\n`;
    }
    if (agent.triggerType === 'MANUAL' || !agent.triggerType) {
      welcome += `- Chatting with me here to ask me to take actions\n`;
    }
    welcome += `- Assigning me to tasks if you want me to work on them\n`;
    welcome += `- @mentioning or DMing me if you want help understanding what I did\n`;

    // Add builder link
    welcome += `\n\nIf you have questions about me or want help editing my setup, visit my profile page.`;

    return welcome;
  }

  private describeTrigger(triggerType: string, triggerConfig: any): string {
    switch (triggerType) {
      case 'TASK_CREATED':
        const location = triggerConfig?.location;
        return `I watch for new tasks created ${location ? `in ${location}` : 'in your workspace'} and automatically process them according to my configuration.`;

      case 'TASK_UPDATED':
        return `I monitor task updates and react when specific conditions are met.`;

      case 'SCHEDULED':
        const schedule = triggerConfig?.schedule;
        return `I run on a schedule (${schedule || 'as configured'}) to perform automated tasks.`;

      case 'MANUAL':
        return `I'm available on-demand. Just ask me to help with tasks!`;

      default:
        return `I'm ready to help you with your tasks.`;
    }
  }

  private generateContextualSuggestions(
    agent: any,
    workspaceContext: UserContext,
    conversationHistory: Array<{ role: string; content: string }>
  ): Array<{
    label: string;
    action: string;
    description?: string;
  }> {
    const suggestions: Array<any> = [];

    // Based on agent type and capabilities
    if (agent.capabilities?.includes('create_tasks')) {
      suggestions.push({
        label: 'Create a task',
        action: 'create_task',
        description: 'Ask me to create a new task',
      });
    }

    if (agent.capabilities?.includes('update_tasks')) {
      suggestions.push({
        label: 'Update a task',
        action: 'update_task',
        description: 'Ask me to update an existing task',
      });
    }

    // Based on recent activity
    if (workspaceContext.recentActivity.mostActiveList) {
      suggestions.push({
        label: `Work on ${workspaceContext.recentActivity.mostActiveList}`,
        action: `focus_list:${workspaceContext.recentActivity.mostActiveList}`,
        description: 'Focus on the most active list',
      });
    }

    return suggestions;
  }
}

export const agentChatService = new AgentChatService();

