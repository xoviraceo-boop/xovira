import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

export const toolRouter = router({
  list: protectedProcedure
    .input(z.object({
      query: z.string().optional(),
      category: z.string().optional(),
      isPublic: z.boolean().optional(),
      page: z.number().int().min(1).optional().default(1),
      pageSize: z.number().int().min(1).max(50).optional().default(12),
      scope: z.enum(["owned","all"]).optional().default("owned"),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const where: any = {};

      if (input.scope === "owned") {
        where.ownerId = userId;
      }
      if (input.category) {
        where.category = input.category;
      }
      if (input.isPublic !== undefined) {
        where.isPublic = input.isPublic;
      }
      if (input.query) {
        const q = input.query.trim();
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ];
      }

      const skip = (input.page - 1) * input.pageSize;
      const take = input.pageSize;

      const [total, items] = await Promise.all([
        prisma.tool.count({ where }),
        prisma.tool.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip,
          take,
        }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      return prisma.tool.findFirst({
        where: {
          id: input.id,
          OR: [{ ownerId: userId }, { isPublic: true }],
        },
      });
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().min(1),
      productUrl: z.string().min(1),
      isPublic: z.boolean().default(true),
      spaceId: z.string().optional(),
      workspaceId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ownerId = ctx.session!.user!.id;
      return prisma.tool.create({
        data: {
          ownerId,
          name: input.name,
          description: input.description,
          category: input.category,
          productUrl: input.productUrl,
          isPublic: input.isPublic,
          spaceId: input.spaceId,
          workspaceId: input.workspaceId,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      category: z.string().optional(),
      productUrl: z.string().optional(),
      isPublic: z.boolean().optional(),
      spaceId: z.string().optional().nullable(),
      workspaceId: z.string().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ownerId = ctx.session!.user!.id;
      const { id, ...updateData } = input;
      
      // Keep null values as is to properly set them to NULL in the database
      // This ensures that when we want to detach a tool by setting spaceId/workspaceId to null,
      // the values are properly set to NULL in the database
      const existing = await prisma.tool.findFirst({ where: { id, ownerId } });
      if (!existing) {
        throw new Error("Tool not found or permission denied");
      }

      const updatePayload: any = {
        ...updateData,
        description: updateData.description ?? undefined
      };
      
      return prisma.tool.update({
        where: { id },
        data: updatePayload,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ownerId = ctx.session!.user!.id;
      const existing = await prisma.tool.findFirst({ where: { id: input.id, ownerId } });
      if (!existing) {
        throw new Error("Tool not found or permission denied");
      }
      return prisma.tool.delete({ where: { id: input.id } });
    }),
});

