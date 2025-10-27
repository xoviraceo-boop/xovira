import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { prisma } from "@/lib/prisma";
import { UsageManager } from "@/features/usage/utils/usageManager";

export const teamRouter = router({
    list: protectedProcedure
        .input(z.object({
            query: z.string().optional(),
            teamType: z.enum(["DEVELOPMENT", "MARKETING", "SALES", "DESIGN", "ADVISORY", "GENERAL"]).optional(),
            industry: z.array(z.string()).optional(),
            isActive: z.boolean().optional(),
            scope: z.enum(["all","owned","participated"]).optional().default("owned"),
            status: z.enum(["DRAFT","PUBLISHED","ARCHIVED"]).optional(),
            page: z.number().int().min(1).optional().default(1),
            pageSize: z.number().int().min(1).max(50).optional().default(12),
        }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.session!.user!.id;
            const where: any = {};

            // Scope
            if (input.scope === "owned") {
                where.ownerId = userId;
            } else if (input.scope === "participated") {
                where.members = { some: { userId } };
            } else {
                where.OR = [{ ownerId: userId }, { members: { some: { userId } } }];
            }

            if (input?.teamType) {
                where.teamType = input.teamType;
            }
            if (input?.industry && input.industry.length > 0) {
                where.industry = { hasSome: input.industry };
            }
            if (input?.isActive !== undefined) {
                where.isActive = input.isActive;
            }
            if (input?.status) {
                where.status = input.status;
            }
            if (input?.query) {
                where.OR = [
                    ...(where.OR || []),
                    { name: { contains: input.query, mode: "insensitive" } },
                    { description: { contains: input.query, mode: "insensitive" } },
                ];
            }

            const skip = (input.page - 1) * input.pageSize;
            const take = input.pageSize;
            const [total, items] = await Promise.all([
                prisma.team.count({ where }),
                prisma.team.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take })
            ]);
            return { items, total, page: input.page, pageSize: input.pageSize };
        }),

	get: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session!.user!.id;
			return prisma.team.findFirst({ 
				where: { 
					id: input.id,
					OR: [
						{ ownerId: userId },
						{ members: { some: { userId } } },
					]
				}
			});
		}),

	publish: protectedProcedure
		.input(
			z.object({
				id: z.string().optional(),
				name: z.string().optional(),
				description: z.string().optional(),
				avatar: z.string().optional(),
				teamType: z.enum(["DEVELOPMENT", "MARKETING", "SALES", "DESIGN", "ADVISORY", "GENERAL"]).optional(),
				industry: z.array(z.string()).optional(),
				skills: z.array(z.string()).optional(),
				location: z.string().optional(),
				isRemote: z.boolean().optional(),
				isHiring: z.boolean().optional(),
				isActive: z.boolean().optional(),
				maxSize: z.number().optional(),
				status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const id = input.id;
			const baseData: any = {
				ownerId: ctx.session!.user!.id,
				name: input.name,
				description: input.description,
				avatar: input.avatar,
				teamType: input.teamType,
				industry: input.industry,
				skills: input.skills,
				location: input.location,
				isRemote: input.isRemote,
				isHiring: input.isHiring,
				isActive: input.isActive ?? true,
				maxSize: input.maxSize,
				status: "PUBLISHED",
			};

			const createdOrUpdated = id
				? await prisma.team.update({ where: { id }, data: baseData })
				: await prisma.team.create({ data: { id: input.id as any, ...baseData } });

			// Update usage for team publish/create
			try {
				await UsageManager.updateServiceUsage(
					ctx.session!.user!.id,
					ctx.session!.user!.name || ctx.session!.user!.email || "",
					"TEAM" as any,
					1,
					ctx.session!.user!.email || undefined
				);
			} catch (e) {
				console.error("Team usage update failed:", e);
			}
			return createdOrUpdated.id;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				description: z.string().optional(),
				avatar: z.string().optional(),
				teamType: z.enum(["DEVELOPMENT", "MARKETING", "SALES", "DESIGN", "ADVISORY", "GENERAL"]).optional(),
				industry: z.array(z.string()).optional(),
				skills: z.array(z.string()).optional(),
				location: z.string().optional(),
				isRemote: z.boolean().optional(),
				isHiring: z.boolean().optional(),
				isActive: z.boolean().optional(),
				maxSize: z.number().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			const updated = await prisma.team.update({ 
				where: { id, ownerId: ctx.session!.user!.id }, 
				data: updateData 
			});
			return updated.id;
		}),

	saveDraft: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				description: z.string().optional(),
				avatar: z.string().optional(),
				teamType: z.enum(["DEVELOPMENT", "MARKETING", "SALES", "DESIGN", "ADVISORY", "GENERAL"]).optional(),
				industry: z.array(z.string()).optional(),
				skills: z.array(z.string()).optional(),
				location: z.string().optional(),
				isRemote: z.boolean().optional(),
				isHiring: z.boolean().optional(),
				isActive: z.boolean().optional(),
				maxSize: z.number().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;
			const baseData: any = {
				...updateData,
				status: "DRAFT",
			};

			const updated = await prisma.team.update({ 
				where: { id, ownerId: ctx.session!.user!.id }, 
				data: baseData 
			});
			return updated.id;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const deleted = await prisma.team.delete({ 
				where: { id: input.id, ownerId: ctx.session!.user!.id } 
			});
			return deleted.id;
		}),

	archive: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const updated = await prisma.team.update({
				where: { id: input.id, ownerId: ctx.session!.user!.id },
				data: { status: "ARCHIVED" },
			});
			return updated.id;
		}),

    // Public endpoints similar to proposals
    getSinglePublicTeam: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return prisma.team.findFirst({
                where: { id: input.id, status: "PUBLISHED" },
                include: {
                    owner: { select: { id: true, name: true, email: true } },
                    likes: { select: { userId: true } },
                }
            });
        }),

    getPublicTeams: protectedProcedure
        .input(z.object({
            query: z.string().optional(),
            teamType: z.enum(["DEVELOPMENT","MARKETING","SALES","DESIGN","ADVISORY","GENERAL"]).optional(),
            industry: z.array(z.string()).optional(),
            location: z.string().optional(),
            sortBy: z.enum(["relevance","latest"]).optional().default("latest"),
            page: z.number().int().min(1).optional().default(1),
            pageSize: z.number().int().min(1).max(50).optional().default(12),
        }))
        .query(async ({ input }) => {
            const where: any = { status: "PUBLISHED" };
            if (input.query) {
                where.OR = [
                    { name: { contains: input.query, mode: "insensitive" } },
                    { description: { contains: input.query, mode: "insensitive" } },
                ];
            }
            if (input.teamType) where.teamType = input.teamType;
            if (input.industry && input.industry.length > 0) where.industry = { hasSome: input.industry };
            if (input.location) where.location = { contains: input.location, mode: "insensitive" };
            const skip = (input.page - 1) * input.pageSize;
            const take = input.pageSize;
            const [total, items] = await Promise.all([
                prisma.team.count({ where }),
                prisma.team.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take, include: { owner: true, likes: true } })
            ]);
            return { items, total, page: input.page, pageSize: input.pageSize };
        }),

    toggleInterest: protectedProcedure
        .input(z.object({ teamId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session!.user!.id;
            const existing = await prisma.teamLike.findFirst({ where: { teamId: input.teamId, userId } });
            if (existing) {
                await prisma.teamLike.delete({ where: { id: existing.id } });
                return { interested: false } as const;
            }
            await prisma.teamLike.create({ data: { teamId: input.teamId, userId } });
            return { interested: true } as const;
        }),
});