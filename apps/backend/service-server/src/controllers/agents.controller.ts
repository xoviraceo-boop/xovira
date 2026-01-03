import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest, JwtAuthGuard } from '@/middleware/httpAuth';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest';
import { checkRateLimit } from '@/utils/ai/checkRateLimit';
import { createAgentGraph, type AgentGraphState } from '@/services/agents/agentGraph';
import { approveExecution } from '@/services/agents/approvalService';
import { agentBuilderService } from '@/services/agents/agentBuilderService';
import { AgentUpdateService } from '@/services/agents/agentUpdateService';
import { agentBuilderContextService } from '@/services/agents/agentBuilderContextService';
import { agentBuilderAssistantService } from '@/services/agents/agentBuilderAssistantService';
import { agentChatService } from '@/services/agents/agentChatService';
import { agentOperatorService } from '@/services/agents/agentOperatorService';
import { getAllTools } from '@/services/agents/toolRegistry';

@Controller('v1/agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  private agentUpdateService = new AgentUpdateService();
  @Post('execute')
  async execute(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const rateLimited = await checkRateLimit(
        {
          headers: {
            get: (key: string) => {
              const headerValue = req.headers[key.toLowerCase()];
              if (Array.isArray(headerValue)) {
                return headerValue[0];
              }
              return headerValue as string | undefined;
            },
          },
        },
        { RPM: 30, RPD: 500 }
      );

      if (rateLimited && 
          typeof rateLimited === 'object' && 
          'status' in rateLimited && 
          'text' in rateLimited && 
          rateLimited instanceof Response) {
        const text = await rateLimited.text();
        return res.status(rateLimited.status).type('application/json').send(text);
      }

      const schema = z.object({
        executionId: z.string().min(1),
        agentId: z.string().min(1),
        inputData: z.any().optional(),
        executionContext: z.any().optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const execution = await prisma.agentExecution.findFirst({
        where: {
          id: body.executionId,
          aiAgent: {
            OR: [
              { createdBy: userId },
              {
                collaborators: {
                  some: { userId, canExecute: true },
                },
              },
            ],
          },
        },
        include: {
          aiAgent: {
            select: {
              id: true,
              isActive: true,
              status: true,
            },
          },
        },
      });

      if (!execution) {
        return res.status(404).json({ error: 'Execution not found or access denied' });
      }

      if (!execution.aiAgent.isActive) {
        return res.status(400).json({ error: 'Agent is not active' });
      }

      await inngest.send({
        name: 'agent/execute',
        data: {
          executionId: body.executionId,
          agentId: body.agentId,
          userId,
          inputData: body.inputData || {},
          executionContext: body.executionContext || {},
        },
      });

      return res.status(202).json({
        success: true,
        executionId: execution.id,
        message: 'Agent execution started',
      });
    } catch (error) {
      console.error('Error executing agent:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: error.errors,
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get(':agentId/executions')
  async listExecutions(
    @Param('agentId') agentId: string,
    @Query('page') pageParam: string | undefined,
    @Query('pageSize') pageSizeParam: string | undefined,
    @Query('status') status: string | undefined,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const userId = req.userId!;
      const page = parseInt(pageParam as string) || 1;
      const pageSize = Math.min(parseInt(pageSizeParam as string) || 20, 50);

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
        return res.status(404).json({ error: 'Agent not found or access denied' });
      }

      const where: any = { agentId };
      if (status) {
        where.status = status;
      }

      const skip = (page - 1) * pageSize;

      const [total, items] = await Promise.all([
        prisma.agentExecution.count({ where }),
        prisma.agentExecution.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          skip,
          take: pageSize,
          include: {
            agentExecutionSteps: {
              orderBy: { stepNumber: 'asc' },
            },
          },
        }),
      ]);

      return res.json({
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      console.error('Error fetching executions:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get(':agentId/executions/:executionId')
  async getExecution(
    @Param('agentId') agentId: string,
    @Param('executionId') executionId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const userId = req.userId!;

      const execution = await prisma.agentExecution.findFirst({
        where: {
          id: executionId,
          agentId,
          aiAgent: {
            OR: [
              { createdBy: userId },
              {
                collaborators: {
                  some: { userId },
                },
              },
            ],
          },
        },
        include: {
          agentExecutionSteps: {
            orderBy: { stepNumber: 'asc' },
          },
          toolCalls: {
            include: {
              agentTool: true,
            },
          },
        },
      });

      if (!execution) {
        return res.status(404).json({ error: 'Execution not found or access denied' });
      }

      return res.json(execution);
    } catch (error) {
      console.error('Error fetching execution:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post(':agentId/cancel/:executionId')
  async cancelExecution(
    @Param('agentId') agentId: string,
    @Param('executionId') executionId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const userId = req.userId!;

      const execution = await prisma.agentExecution.findFirst({
        where: {
          id: executionId,
          agentId,
          aiAgent: {
            OR: [
              { createdBy: userId },
              {
                collaborators: {
                  some: { userId, canExecute: true },
                },
              },
            ],
          },
        },
      });

      if (!execution) {
        return res.status(404).json({ error: 'Execution not found or access denied' });
      }

      if (!['QUEUED', 'RUNNING'].includes(execution.status)) {
        return res.status(400).json({ error: 'Execution cannot be cancelled' });
      }

      await prisma.agentExecution.update({
        where: { id: executionId },
        data: {
          status: 'CANCELLED',
          completedAt: new Date(),
        },
      });

      return res.json({
        success: true,
        message: 'Execution cancelled',
      });
    } catch (error) {
      console.error('Error cancelling execution:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('chat')
  async chat(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        userId: z.string(),
        message: z.string().min(1),
        conversationId: z.string().optional(),
        workspaceId: z.string().optional(),
        agentId: z.string().min(1),
        context: z.any().optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      // Validate agent exists and user has access
      // Note: Allow DRAFT agents during creation, not just active ones
      const agent = await prisma.aiAgent.findFirst({
        where: {
          id: body.agentId,
          OR: [
            { createdBy: userId },
            { collaborators: { some: { userId, canExecute: true } } }
          ]
        }
      });

      if (!agent) {
        return res.status(404).json({
          error: 'Agent not found or access denied',
          message: 'The specified agent does not exist or you do not have access to it.'
        });
      }

      const execution = await prisma.agentExecution.create({
        data: {
          id: randomUUID(),
          agentId: body.agentId,
          triggeredBy: 'MANUAL',
          triggerUserId: userId,
          inputData: { message: body.message, context: body.context },
          status: 'QUEUED',
          startedAt: new Date(),
        },
      });

      const graph = createAgentGraph();
      const initialState = {
        userId: body.userId,
        agentId: body.agentId,
        message: body.message,
        conversationId: body.conversationId,
        workspaceId: body.workspaceId,
        status: 'PENDING' as const,
      };

      const result = await graph.invoke(initialState as any);

      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: result.status === 'COMPLETED' ? 'COMPLETED' : 'FAILED',
          outputData: result,
          completedAt: new Date(),
          reasoning: result.intent ? [result.intent] : [],
        },
      });

      return res.json({
        response: result.response || 'Processing complete',
        intent: result.intent,
        plan: result.plan,
        requiresApproval: result.plan?.requiresApproval || false,
        approvalRequest: result.approvalRequest,
        contextUsed: result.plan?.contextUsed || [],
        conversationId: body.conversationId || `conv_${Date.now()}`,
      });
    } catch (error) {
      console.error('Error in chat:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('approve-execution')
  async approve(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        executionId: z.string(),
        userId: z.string(),
        approved: z.boolean(),
        reason: z.string().optional(),
      });

      const body = schema.parse(req.body);
      await approveExecution(body.executionId, body.userId, body.approved, body.reason);

      return res.json({
        success: true,
        executionId: body.executionId,
        status: body.approved ? 'APPROVED' : 'REJECTED',
      });
    } catch (error) {
      console.error('Error approving execution:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Agent Operator endpoints
  @Post('operator/initialize')
  async initializeOperator(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        conversationId: z.string().optional(),
        agentId: z.string().optional(),
        skipWelcome: z.boolean().optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      if (!body.agentId) {
        return res.status(400).json({ error: 'agentId is required for operator initialization' });
      }

      const result = await agentOperatorService.initializeConversation(
        userId,
        body.agentId,
        body.conversationId,
        body.skipWelcome
      );

      return res.json(result);
    } catch (error) {
      console.error('[AgentOperator] Error initializing operator:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500;
      return res.status(statusCode).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('operator/message')
  async operatorMessage(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        conversationId: z.string(),
        agentId: z.string().min(1),
        message: z.string().min(1),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await agentOperatorService.processMessage(
        body.conversationId,
        body.agentId,
        body.message,
        userId
      );

      return res.json(result);
    } catch (error) {
      console.error('[AgentOperator] Error processing operator message:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request', details: error.errors });
      }
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('operator/chat')
  async operatorChat(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        agentId: z.string().min(1),
        message: z.string().min(1),
        workspaceId: z.string().optional(),
        conversationId: z.string().optional(),
        context: z.any().optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      // If conversationId is provided, use processMessage; otherwise initialize first
      if (body.conversationId) {
        const result = await agentOperatorService.processMessage(
          body.conversationId,
          body.agentId,
          body.message,
          userId
        );
        return res.json(result);
      } else {
        // Initialize conversation first, then process message
        const initResult = await agentOperatorService.initializeConversation(
          userId,
          body.agentId,
          undefined,
          true // Skip welcome for chat
        );
        
        const result = await agentOperatorService.processMessage(
          initResult.conversationId,
          body.agentId,
          body.message,
          userId
        );
        return res.json(result);
      }
    } catch (error) {
      console.error('[AgentOperator] Error in operator chat:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request', details: error.errors });
      }
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('operator/apply')
  async operatorApply(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        agentId: z.string().min(1),
        patch: z.record(z.any()),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await agentOperatorService.applySuggestedChanges(body.agentId, userId, body.patch);
      return res.json(result);
    } catch (error) {
      console.error('[AgentOperator] Error applying patch:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request', details: error.errors });
      }
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('operator/execute')
  async operatorExecute(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        agentId: z.string().min(1),
        inputData: z.any().optional(),
        executionContext: z.any().optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await agentOperatorService.triggerExecution(
        body.agentId,
        userId,
        body.inputData,
        body.executionContext
      );

      return res.json(result);
    } catch (error) {
      console.error('[AgentOperator] Error triggering execution:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request', details: error.errors });
      }
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Agent Builder endpoints
  @Post('builder/initialize')
  async initializeBuilder(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        conversationId: z.string().optional(),
        agentId: z.string().optional(),
        skipWelcome: z.boolean().optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      // Log for debugging
      console.log('[AgentBuilder] Initialize request:', {
        userId,
        conversationId: body.conversationId || 'NEW',
        agentId: body.agentId || 'NONE',
        skipWelcome: body.skipWelcome || false,
      });

      const result = await agentBuilderService.initializeConversation(
        userId,
        body.conversationId,
        body.agentId,
        body.skipWelcome || false,
      );

      console.log('[AgentBuilder] Initialize result:', {
        conversationId: result.conversationId,
        hasState: !!result.conversationState,
        stage: result.conversationState?.stage,
      });

      return res.json(result);
    } catch (error) {
      console.error('[AgentBuilder] Error initializing builder:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 :
                        error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500;
      return res.status(statusCode).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('builder/message')
  async builderMessage(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        conversationId: z.string(),
        message: z.string().min(1),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await agentBuilderService.processMessage(
        body.conversationId,
        body.message,
        userId
      );

      return res.json(result);
    } catch (error) {
      console.error('Error processing builder message:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('builder/update-draft')
  async updateDraft(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        conversationId: z.string(),
        draft: z.any(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await agentBuilderService.updateDraft(
        body.conversationId,
        body.draft,
        userId
      );

      return res.json(result);
    } catch (error) {
      console.error('Error updating draft:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('builder/launch')
  async launchAgent(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const schema = z.object({
        conversationId: z.string(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await agentBuilderService.launchAgent(body.conversationId, userId);

      return res.json(result);
    } catch (error) {
      console.error('Error launching agent:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Builder View endpoints
  @Get('builder-view/:agentId')
  async getBuilderData(
    @Param('agentId') agentId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const userId = req.userId!;

      const agent = await prisma.aiAgent.findFirst({
        where: {
          id: agentId,
          OR: [
            { createdBy: userId },
            { collaborators: { some: { userId } } }
          ]
        }
      });

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found or access denied' });
      }

      const userContext = await agentBuilderContextService.fetchUserContext(userId);
      const validation = await this.agentUpdateService.validateAgentUpdate(agentId, {});

      return res.json({
        agent,
        userContext,
        validation,
      });
    } catch (error) {
      console.error('Error getting builder data:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('builder-view/:agentId/update')
  async updateAgentBuilder(
    @Param('agentId') agentId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const schema = z.object({
        updates: z.any(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await this.agentUpdateService.updateAgent({
        agentId,
        updates: body.updates,
        userId,
      });

      return res.json(result);
    } catch (error) {
      console.error('Error updating agent:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('builder-view/:agentId/assistant')
  async builderAssistant(
    @Param('agentId') agentId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const schema = z.object({
        message: z.string().min(1),
        conversationHistory: z.array(z.object({
          role: z.string(),
          content: z.string(),
        })).optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await agentBuilderAssistantService.processBuilderAssistantMessage(
        agentId,
        userId,
        body.message,
        body.conversationHistory || []
      );

      return res.json(result);
    } catch (error) {
      console.error('Error processing assistant message:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('builder-view/:agentId/validate')
  async validateAgent(
    @Param('agentId') agentId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const userId = req.userId!;

      const result = await this.agentUpdateService.validateAgentUpdate(agentId, {});

      return res.json(result);
    } catch (error) {
      console.error('Error validating agent:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('builder-view/:agentId/versions')
  async getAgentVersions(
    @Param('agentId') agentId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const userId = req.userId!;

      const result = await this.agentUpdateService.getAgentVersions(agentId, userId);

      return res.json(result);
    } catch (error) {
      console.error('Error getting agent versions:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('builder-view/:agentId/restore-version')
  async restoreVersion(
    @Param('agentId') agentId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const schema = z.object({
        versionId: z.string(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await this.agentUpdateService.restoreVersion(agentId, body.versionId, userId);

      return res.json(result);
    } catch (error) {
      console.error('Error restoring version:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Chat View endpoints
  @Get('chat-view/:agentId/welcome')
  async getWelcomeMessage(
    @Param('agentId') agentId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const userId = req.userId!;

      const result = await agentChatService.getWelcomeMessage(agentId, userId);

      return res.json(result);
    } catch (error) {
      console.error('Error getting welcome message:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('chat-view/:agentId/context')
  async getChatContext(
    @Param('agentId') agentId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const userId = req.userId!;

      const result = await agentChatService.getChatContext(agentId, userId);

      return res.json(result);
    } catch (error) {
      console.error('Error getting chat context:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('chat-view/:agentId/chat')
  async chatViewMessage(
    @Param('agentId') agentId: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response
  ) {
    try {
      const schema = z.object({
        message: z.string().min(1),
        conversationId: z.string().optional(),
        workspaceId: z.string().optional(),
        context: z.any().optional(),
      });

      const body = schema.parse(req.body);
      const userId = req.userId!;

      const result = await agentChatService.processAgentChatMessage(
        agentId,
        body.conversationId,
        userId,
        body.message,
        body.workspaceId
      );

      return res.json(result);
    } catch (error) {
      console.error('Error processing chat message:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Get('system-tools')
  async getSystemTools(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    try {
      const tools = await getAllTools();
      
      // Map to frontend-friendly format
      const formattedTools = tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        category: tool.category,
      }));

      return res.json(formattedTools);
    } catch (error) {
      console.error('Error fetching system tools:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
