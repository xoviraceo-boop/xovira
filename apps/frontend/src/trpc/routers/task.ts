import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

export const taskRouter = router({
  list: protectedProcedure
    .input(z.object({
      workspaceId: z.string().optional(),
      spaceId: z.string().optional(),
      channelId: z.string().optional(),
      projectId: z.string().optional(),
      teamId: z.string().optional(),
      assigneeId: z.string().optional(),
      status: z.array(z.string()).optional(),
      visibility: z.enum(["PRIVATE","TEAM","WORKSPACE","PUBLIC"]).optional(),
      query: z.string().optional(),
      page: z.number().int().min(1).optional().default(1),
      pageSize: z.number().int().min(1).max(50).optional().default(12),
      scope: z.enum(["owned","assigned","all"]).optional().default("owned"),
      includeRelations: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const where: any = {};

      if (input.workspaceId) where.workspaceId = input.workspaceId;
      if (input.channelId) where.channelId = input.channelId;
      if (input.spaceId) where.spaceId = input.spaceId;
      if (input.projectId) where.projectId = input.projectId;
      if (input.teamId) where.teamId = input.teamId;
      if (input.assigneeId) where.assigneeId = input.assigneeId;
      if (input.visibility) where.visibility = input.visibility as any;
      if (input.status?.length) where.status = { in: input.status };

      if (input.scope === "owned") {
        where.createdBy = userId;
      } else if (input.scope === "assigned") {
        where.assigneeId = userId;
      } else if (input.scope === "all") {
        where.OR = [
          { createdBy: userId },
          { assigneeId: userId },
        ];
      }

      if (input.query) {
        const q = input.query.trim();
        where.OR = [
          ...(where.OR || []),
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ];
      }

      const skip = (input.page - 1) * input.pageSize;
      const take = input.pageSize;

      const include = input.includeRelations
        ? {
            assignee: { select: { id: true, name: true, email: true, image: true } },
            project: { select: { id: true, name: true } },
            team: { select: { id: true, name: true } },
            channel: { select: { id: true, name: true } },
            list: { select: { id: true, name: true } },
          }
        : undefined;

      const [total, items] = await Promise.all([
        prisma.task.count({ where }),
        prisma.task.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip,
          take,
          include,
        }),
      ]);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      return prisma.task.findFirst({
        where: {
          id: input.id,
          OR: [{ createdBy: userId }, { assigneeId: userId }],
        },
        include: {
          assignee: { select: { id: true, name: true, email: true, image: true } },
          channel: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } },
        },
      });
    }),

  create: protectedProcedure
    .input(z.object({
      workspaceId: z.string().optional(),
      spaceId: z.string().optional(),
      channelId: z.string().optional(),
      projectId: z.string().optional(),
      teamId: z.string().optional(),
      assigneeId: z.string().optional(),
      listId: z.string().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      visibility: z.enum(["PRIVATE","TEAM","WORKSPACE","PUBLIC"]).default("PRIVATE"),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const task = await prisma.task.create({
        data: {
          workspaceId: input.workspaceId,
          spaceId: input.spaceId,
          channelId: input.channelId,
          projectId: input.projectId,
          teamId: input.teamId,
          title: input.title,
          assigneeId: input.assigneeId,
          listId: input.listId,
          description: input.description,
          visibility: input.visibility as any,
          isPublic: input.isPublic,
          createdBy: userId,
        },
      });
      return task;
    }),

  publish: protectedProcedure
    .input(z.object({ taskId: z.string(), isPublic: z.boolean() }))
    .mutation(async ({ input }) => {
      return prisma.task.update({
        where: { id: input.taskId },
        data: {
          isPublic: input.isPublic,
          visibility: input.isPublic ? ("PUBLIC" as any) : "PRIVATE",
        },
      });
    }),

  createProposalFromTask: protectedProcedure
    .input(z.object({ taskId: z.string(), category: z.enum(["COFOUNDER","MENTOR","CUSTOMER","INVESTOR","PARTNER","MEMBERSHIP"]).default("PARTNER") }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const task = await prisma.task.findUnique({ where: { id: input.taskId } });
      if (!task) throw new Error("Task not found");
      if (task.proposalId) return prisma.proposal.findUnique({ where: { id: task.proposalId } });

      const proposal = await prisma.proposal.create({
        data: {
          userId,
          createdBy: userId,
          category: input.category as any,
          projectId: task.projectId || undefined,
          teamId: task.teamId || undefined,
          title: task.title,
          shortSummary: task.description?.slice(0, 500) || task.title,
          detailedDesc: task.description || task.title,
          industry: [],
          keywords: [],
          intent: "OFFERING",
          visibility: "PUBLIC",
          status: "PUBLISHED",
          workspaceId: task.workspaceId || undefined,
        },
      });

      await prisma.task.update({ where: { id: task.id }, data: { proposalId: proposal.id } });
      return proposal;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      status: z.string().optional(),
      assigneeId: z.string().optional().nullable(),
      workspaceId: z.string().optional().nullable(),
      spaceId: z.string().optional().nullable(),
      channelId: z.string().optional().nullable(),
      projectId: z.string().optional().nullable(),
      teamId: z.string().optional().nullable(),
      visibility: z.enum(["PRIVATE","TEAM","WORKSPACE","PUBLIC"]).optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const { id, ...updateData } = input;

      const existing = await prisma.task.findFirst({
        where: { id, createdBy: userId },
      });
      if (!existing) {
        throw new Error("Task not found or permission denied");
      }

      const data: any = {};
      if (updateData.title !== undefined) data.title = updateData.title;
      if (updateData.description !== undefined) data.description = updateData.description ?? undefined;
      if (updateData.status !== undefined) data.status = updateData.status;
      if (updateData.assigneeId !== undefined) data.assigneeId = updateData.assigneeId ?? undefined;
      if (updateData.workspaceId !== undefined) data.workspaceId = updateData.workspaceId ?? undefined;
      if (updateData.spaceId !== undefined) data.spaceId = updateData.spaceId ?? undefined;
      if (updateData.channelId !== undefined) data.channelId = updateData.channelId ?? undefined;
      if (updateData.projectId !== undefined) data.projectId = updateData.projectId ?? undefined;
      if (updateData.teamId !== undefined) data.teamId = updateData.teamId ?? undefined;
      if (updateData.visibility !== undefined) data.visibility = updateData.visibility;
      if (updateData.isPublic !== undefined) data.isPublic = updateData.isPublic;

      return prisma.task.update({
        where: { id },
        data: data as any,
      });
    }),

  assign: protectedProcedure
    .input(z.object({
      id: z.string(),
      assigneeId: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const task = await prisma.task.findFirst({ where: { id: input.id, createdBy: userId } });
      if (!task) {
        throw new Error("Task not found or permission denied");
      }
      return prisma.task.update({ where: { id: input.id }, data: { assigneeId: input.assigneeId ?? null } });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const task = await prisma.task.findFirst({ where: { id: input.id, createdBy: userId } });
      if (!task) {
        throw new Error("Task not found or permission denied");
      }
      return prisma.task.delete({ where: { id: input.id } });
    }),
});

