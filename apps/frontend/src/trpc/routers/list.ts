import { z } from "zod";
import { router, protectedProcedure } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

async function assertContextAccess(
  workspaceId: string | undefined,
  spaceId: string | undefined,
  projectId: string | undefined,
  teamId: string | undefined,
  userId: string
) {
  // At least one context must be provided
  if (!workspaceId && !spaceId && !projectId && !teamId) {
    throw new Error("At least one context (workspace, space, project, or team) must be provided");
  }

  // If workspaceId is provided, verify access
  if (workspaceId) {
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
  }

  // If projectId is provided, verify access
  if (projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true, workspaceId: true },
    });

    if (!project) {
      throw new Error("Project not found or permission denied");
    }

    // Use project's workspaceId if workspaceId not provided
    if (!workspaceId && project.workspaceId) {
      return project.workspaceId;
}
  }

  // If teamId is provided, verify access
  if (teamId) {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true, workspaceId: true },
    });

    if (!team) {
      throw new Error("Team not found or permission denied");
    }

    // Use team's workspaceId if workspaceId not provided
    if (!workspaceId && team.workspaceId) {
      return team.workspaceId;
    }
  }

  // If spaceId is provided, verify access
  if (spaceId) {
    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
        workspace: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
      },
      select: { id: true, workspaceId: true },
    });

    if (!space) {
      throw new Error("Space not found or permission denied");
    }

    // Use space's workspaceId if workspaceId not provided
    if (!workspaceId && space.workspaceId) {
      return space.workspaceId;
    }
  }

  return workspaceId;
}

const baseContextSchema = z.object({
  workspaceId: z.string().optional(),
  spaceId: z.string().optional(),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
  folderId: z.string().optional(),
});

const contextSchema = baseContextSchema.refine(
  (data) => data.workspaceId || data.spaceId || data.projectId || data.teamId,
  {
    message: "At least one context (workspace, space, project, or team) must be provided",
  }
);

export const listRouter = router({
  byContext: protectedProcedure
    .input(contextSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const resolvedWorkspaceId = await assertContextAccess(
        input.workspaceId,
        input.spaceId,
        input.projectId,
        input.teamId,
        userId
      );

      const where: any = {};

      if (resolvedWorkspaceId) where.workspaceId = resolvedWorkspaceId;
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
      baseContextSchema
        .extend({
          name: z.string().min(1),
          description: z.string().optional().nullable(),
          color: z.string().optional().nullable(),
          icon: z.string().optional().nullable(),
          position: z.number().int().optional(),
        })
        .refine(
          (data) =>
            data.workspaceId || data.spaceId || data.projectId || data.teamId,
          {
            message:
              "At least one context (workspace, space, project, or team) must be provided",
          },
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const resolvedWorkspaceId = await assertContextAccess(
        input.workspaceId,
        input.spaceId,
        input.projectId,
        input.teamId,
        userId
      );

      if (!resolvedWorkspaceId) {
        throw new Error("Unable to resolve workspace context");
      }

      const position =
        input.position ??
        (await prisma.list.count({
          where: { workspaceId: resolvedWorkspaceId },
        }));

      const list = await prisma.list.create({
        data: {
          name: input.name,
          description: input.description ?? undefined,
          color: input.color ?? undefined,
          icon: input.icon ?? undefined,
          position,
          workspaceId: resolvedWorkspaceId,
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

