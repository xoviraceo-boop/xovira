import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

const filterEnum = z.enum([
  "all",
  "feature",
  "design",
  "implementation",
  "bugs",
  "announcements",
  "others",
  "issues",
  "pinned",
  "author",
  "active",
  "upvoted",
]);

export const discussionsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        query: z.string().optional(),
        filter: filterEnum.optional().default("all"),
        page: z.number().int().min(1).optional().default(1),
        pageSize: z.number().int().min(1).max(50).optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;

      // Ensure membership to view project discussions
      const canView = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          OR: [
            { ownerId: userId },
            { members: { some: { userId, isBlocked: false, canViewProject: true } } },
            { teams: { some: { team: { members: { some: { userId } } } } } },
          ],
        },
        select: { id: true },
      });
      if (!canView) return { items: [], total: 0, page: input.page, pageSize: input.pageSize } as const;

      const where: any = { projectId: input.projectId };
      if (input.query) {
        where.OR = [
          { content: { contains: input.query, mode: "insensitive" } },
        ];
      }

      // Basic filter mapping on top of posts
      if (input.filter === "pinned") where.isPinned = true;
      if (input.filter === "author") where.userId = userId; // self

      const skip = (input.page - 1) * input.pageSize;
      const take = input.pageSize;

      const orderBy = (() => {
        switch (input.filter) {
          case "active":
            return { updatedAt: "desc" as const };
          case "upvoted":
            return { likeCount: "desc" as const };
          default:
            return { updatedAt: "desc" as const };
        }
      })();

      const [total, posts] = await Promise.all([
        prisma.post.count({ where }),
        prisma.post.findMany({ where, orderBy, skip, take, include: { _count: { select: { comments: true } } } }),
      ]);

      const items = posts.map((p) => ({
        id: p.id,
        projectId: p.projectId!,
        title: p.content.split("\n")[0]?.slice(0, 120) || "Untitled discussion",
        summary: p.content.split("\n").slice(1).join(" ").slice(0, 180),
        tags: [] as string[],
        isPinned: p.isPinned,
        upvotes: p.likeCount,
        _count: { comments: (p as any)._count?.comments ?? 0 },
        updatedAt: p.updatedAt,
      }));

      return { items, total, page: input.page, pageSize: input.pageSize } as const;
    }),

  get: protectedProcedure
    .input(z.object({ projectId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      const canView = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          OR: [
            { ownerId: userId },
            { members: { some: { userId, isBlocked: false, canViewProject: true } } },
            { teams: { some: { team: { members: { some: { userId } } } } } },
          ],
        },
        select: { id: true },
      });
      if (!canView) return null;

      const post = await prisma.post.findFirst({
        where: { id: input.id, projectId: input.projectId },
        include: { user: { select: { id: true, name: true, image: true } } },
      });
      if (!post) return null;

      return {
        id: post.id,
        projectId: post.projectId!,
        title: post.content.split("\n")[0] || "Untitled discussion",
        body: post.content.split("\n").slice(1).join("\n"),
        isPinned: post.isPinned,
        upvotes: post.likeCount,
        author: post.user,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      } as const;
    }),

  create: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().min(1),
        body: z.string().optional(),
        isPinned: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;

      const canPost = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          OR: [
            { ownerId: userId },
            { members: { some: { userId, isBlocked: false, canPost: true } } },
          ],
        },
        select: { id: true },
      });
      if (!canPost) throw new Error("Not authorized to post in this project");

      const content = [input.title, input.body?.trim()].filter(Boolean).join("\n\n");
      const created = await prisma.post.create({
        data: {
          userId,
          projectId: input.projectId,
          content,
          isPinned: input.isPinned ?? false,
          type: "UPDATE",
          visibility: "TEAM",
        },
        select: { id: true },
      });

      return { id: created.id } as const;
    }),
});


