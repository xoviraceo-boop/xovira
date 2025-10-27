import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

export const postsRouter = router({
  list: protectedProcedure
    .input(z.object({
      feedType: z.enum(["global", "user", "project"]).default("global"),
      feedId: z.string().optional(),
      page: z.number().int().min(1).optional().default(1),
      pageSize: z.number().int().min(1).max(50).optional().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;

      const where: any = {};

      if (input.feedType === "user") {
        where.userId = input.feedId ?? userId;
      }

      if (input.feedType === "project") {
        if (!input.feedId) throw new Error("feedId (projectId) required");
        where.projectId = input.feedId;
      }

      const skip = (input.page - 1) * input.pageSize;
      const take = input.pageSize;

      const [total, items] = await Promise.all([
        prisma.post.count({ where }),
        prisma.post.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          include: {
            user: true,
            project: true,
            team: true,
          },
        }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),
});

export type PostsRouter = typeof postsRouter;


