import { z } from "zod";
import { router, protectedProcedure } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

async function assertWorkspaceAccess(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true },
  });

  if (!workspace) {
    throw new Error("Workspace not found or permission denied");
  }

  return workspace;
}

const contextSchema = z.object({
  workspaceId: z.string(),
  spaceId: z.string().optional(),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
  folderId: z.string().optional(),
});

export const listRouter = router({
  byContext: protectedProcedure
    .input(contextSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      await assertWorkspaceAccess(input.workspaceId, userId);

      const where: any = {
        workspaceId: input.workspaceId,
      };

      if (input.spaceId) where.spaceId = input.spaceId;
      if (input.projectId) where.projectId = input.projectId;
      if (input.teamId) where.teamId = input.teamId;
      if (input.folderId) where.folderId = input.folderId;

      const lists = await prisma.list.findMany({
        where,
        orderBy: { position: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          icon: true,
          workspaceId: true,
          spaceId: true,
          projectId: true,
          teamId: true,
          folderId: true,
        },
      });

      return { items: lists };
    }),

  create: protectedProcedure
    .input(
      contextSchema.extend({
        name: z.string().min(1),
        description: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        icon: z.string().optional().nullable(),
        position: z.number().int().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      await assertWorkspaceAccess(input.workspaceId, userId);

      const position =
        input.position ??
        (await prisma.list.count({
          where: { workspaceId: input.workspaceId },
        }));

      const list = await prisma.list.create({
        data: {
          name: input.name,
          description: input.description ?? undefined,
          color: input.color ?? undefined,
          icon: input.icon ?? undefined,
          position,
          workspaceId: input.workspaceId,
          spaceId: input.spaceId ?? undefined,
          projectId: input.projectId ?? undefined,
          teamId: input.teamId ?? undefined,
          folderId: input.folderId ?? undefined,
        },
        select: {
          id: true,
          name: true,
          description: true,
          color: true,
          icon: true,
          position: true,
          workspaceId: true,
          spaceId: true,
          projectId: true,
          teamId: true,
          folderId: true,
        },
      });

      return list;
    }),
});

