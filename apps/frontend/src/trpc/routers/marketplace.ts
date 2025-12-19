import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { prisma } from "@/lib/prisma";
import { SubscriptionManager } from "@/features/billing/utils/subscriptionManager";

async function assertSubscribed(userId: string) {
  const subscription = await SubscriptionManager.getCurrentSubscription(userId);
  if (!subscription || subscription.plan?.planType === "FREE") {
    throw new Error("Advanced AI matching is available for paid plans only");
  }
}

export const marketplaceRouter = router({
  searchProjects: protectedProcedure
    .input(z.object({ query: z.string().min(1), advancedAi: z.boolean().default(false), limit: z.number().int().min(1).max(50).default(20), filters: z.any().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.user!.id;
      if (input.advancedAi) await assertSubscribed(userId);

      if (!input.advancedAi) {
        return prisma.project.findMany({
          where: { isPublic: true, isActive: true, name: { contains: input.query, mode: "insensitive" } },
          take: input.limit,
          select: { id: true, name: true, description: true, tags: true, industry: true },
        });
      }

      // AI matching via service-server (not cron), immediate results
      const baseUrl = process.env.SERVICE_SERVER_URL || process.env.NEXT_PUBLIC_SERVICE_SERVER_URL
      if (!baseUrl) {
        throw new Error("SERVICE_SERVER_URL is not configured");
      }
      const resp = await fetch(`${baseUrl}/v1/matching/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.SERVICE_SERVER_API_KEY || "",
        },
        body: JSON.stringify({
          userId,
          type: "projects",
          query: input.query,
          limit: input.limit,
          filters: input.filters,
        }),
        // Avoid Next.js caching on server
        cache: "no-store",
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "Service matching failed");
      }
      return resp.json();
    }),
});

