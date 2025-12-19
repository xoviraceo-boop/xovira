import { ConversationType, ModelName } from '@xovira/database/src/generated/prisma/client';
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { initializeOpenAI } from '@/lib/openai'
import { ensureChatContext, type ChatContextType } from '@/entities/chats/utils'
import { LimitGuard } from '@/features/usage/utils/limitGuard'
import { protectedProcedure, router } from '@/trpc/init'

export const chatRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        contextType: z.enum(['project', 'profile', 'proposal', 'team', 'workspace', 'space', 'channel']),
        entityId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = prisma as any

      const where: any = {
        userId: ctx.session.user.id,
      }

      switch (input.contextType) {
        case 'project':
          where.projectId = input.entityId
          break
        case 'proposal':
          where.proposalId = input.entityId
          break
        case 'team':
          where.teamId = input.entityId
          break
        case 'workspace':
          where.workspaceId = input.entityId
          break
        case 'space':
          where.spaceId = input.entityId
          break
        case 'channel':
          where.channelId = input.entityId
          break
        case 'profile':
          where.userId = input.entityId
          where.projectId = null
          where.proposalId = null
          where.teamId = null
          where.workspaceId = null
          where.spaceId = null
          where.channelId = null
          break
      }

      const conversations = await db.aiConversation.findMany({
        where,
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          projectId: true,
          proposalId: true,
          teamId: true,
          workspaceId: true,
          spaceId: true,
          channelId: true,
          conversationType: true,
          lastMessageAt: true,
          createdAt: true,
          messageCount: true,
          totalTokensUsed: true,
        },
      })

      return conversations
    }),

  listByProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = prisma as any

      const conversations = await db.aiConversation.findMany({
        where: {
          userId: ctx.session.user.id,
          projectId: input.projectId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          projectId: true,
          conversationType: true,
          lastMessageAt: true,
          createdAt: true,
          messageCount: true,
          totalTokensUsed: true,
        },
      })

      return conversations
    }),
  
  getModel: protectedProcedure
    .query(async ({ ctx }) => {
      const db = prisma;
      const model = await db.aiModel.findFirst();
      return model;
    }),

    getModelConfig: protectedProcedure.query(async ({ ctx }) => {
      const db = prisma;
      const userId = ctx.session!.user!.id;
  
      const subscription = await db.subscription.findFirst({
        where: { userId, status: { in: ["ACTIVE", "TRIALING", "PAST_DUE"] } },
        orderBy: { updatedAt: "desc" },
        include: {
          plan: {
            include: { feature: true }, 
          },
        },
      });
      if (!subscription) {
        throw new Error("No active subscription found");
      }
      const maxRPM = subscription.plan?.feature?.maxRPM ?? 0;
      const maxRPD = subscription.plan?.feature?.maxRPD ?? 0;
      return { maxRPM, maxRPD };
    }),    

  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = prisma as any

      const conversation = await db.aiConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
          title: true,
          projectId: true,
        },
      })

      if (!conversation) {
        throw new Error('Conversation not found')
      }

      const messages = await db.aiMessage.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
      })

      return {
        conversation,
        messages,
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        contextType: z.enum(['project', 'profile', 'proposal', 'team', 'workspace', 'space', 'channel']),
        entityId: z.string(),
        modelId: z.string(),
        title: z.string().optional(),
        systemPrompt: z.string().optional(),
        conversationType: z.nativeEnum(ConversationType).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await LimitGuard.ensureWithinChatLimit(
        ctx.session.user.id,
        input.contextType as ChatContextType,
        input.entityId
      )

      const db = prisma as any
      const openai = initializeOpenAI()

      const data: any = {
        userId: ctx.session.user.id,
        title: input.title || 'New chat',
        conversationType: input.conversationType ?? ConversationType.GENERAL,
        systemPrompt: input.systemPrompt,
        modelId: input.modelId
      }

      switch (input.contextType) {
        case 'project':
          data.projectId = input.entityId
          data.conversationType = input.conversationType ?? ConversationType.PROJECT_HELP
          break
        case 'proposal':
          data.proposalId = input.entityId
          data.conversationType = input.conversationType ?? ConversationType.GENERAL
          break
        case 'team':
          data.teamId = input.entityId
          data.conversationType = input.conversationType ?? ConversationType.TEAM_COORDINATION
          break
        case 'workspace':
          data.workspaceId = input.entityId
          data.conversationType = input.conversationType ?? ConversationType.GENERAL
          break
        case 'space':
          data.spaceId = input.entityId
          data.conversationType = input.conversationType ?? ConversationType.GENERAL
          break
        case 'channel':
          data.channelId = input.entityId
          data.conversationType = input.conversationType ?? ConversationType.GENERAL
          break
        case 'profile':
          data.conversationType = input.conversationType ?? ConversationType.MENTORSHIP
          break
      }

      const conversation = await db.aiConversation.create({
        data,
        include: {
          model: true,
        },
      })

      await ensureChatContext(conversation.id, input.contextType as ChatContextType, input.entityId, openai)

      return {
        id: conversation.id,
        title: conversation.title,
        projectId: conversation.projectId,
        proposalId: conversation.proposalId,
        teamId: conversation.teamId,
        model: conversation.model?.name,
        conversationType: conversation.conversationType,
      }
    }),

  rename: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        title: z.string().min(1).max(120),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = prisma as any

      const existing = await db.aiConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
        },
      })

      if (!existing) {
        throw new Error('Conversation not found')
      }

      const conversation = await db.aiConversation.update({
        where: {
          id: input.conversationId,
        },
        data: {
          title: input.title,
        },
        select: {
          id: true,
          title: true,
        },
      })

      return conversation
    }),

  delete: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = prisma as any

      const existing = await db.aiConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
        },
      })

      if (!existing) {
        throw new Error('Conversation not found')
      }

      await db.aiConversation.delete({
        where: {
          id: input.conversationId,
        },
      })

      return { success: true }
    }),

  archive: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        archived: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = prisma as any

      const existing = await db.aiConversation.findFirst({
        where: {
          id: input.conversationId,
          userId: ctx.session.user.id,
        },
        select: {
          id: true,
        },
      })

      if (!existing) {
        throw new Error('Conversation not found')
      }

      // Note: You may need to add an 'archived' field to your schema
      // For now, we'll use a soft delete pattern or you can add the field
      const conversation = await db.aiConversation.update({
        where: {
          id: input.conversationId,
        },
        data: {
          // If you have an archived field: archived: input.archived
          // For now, we'll just return success
        },
        select: {
          id: true,
        },
      })

      return conversation
    }),
})
