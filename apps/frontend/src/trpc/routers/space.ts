import { z } from "zod";
import { router, protectedProcedure } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

const listInputSchema = z.object({
	query: z.string().optional(),
	scope: z.enum(["owned", "member", "all"]).optional().default("owned"),
	status: z.enum(["active", "archived"]).optional(),
	workspaceId: z.string().optional(),
	page: z.number().int().min(1).optional().default(1),
	pageSize: z.number().int().min(1).max(50).optional().default(12),
	includeCounts: z.boolean().optional(),
});

const createInputSchema = z.object({
	workspaceId: z.string(),
	name: z.string().min(1),
	description: z.string().optional().nullable(),
	isActive: z.boolean().optional(),
});

const updateInputSchema = z.object({
	id: z.string(),
	name: z.string().min(1).optional(),
	description: z.string().optional().nullable(),
	isActive: z.boolean().optional(),
});

const memberMutationSchema = z.object({
	spaceId: z.string(),
	userId: z.string(),
	role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).optional().default("MEMBER"),
});

async function assertWorkspaceAccess(workspaceId: string, userId: string) {
	const workspace = await prisma.workspace.findFirst({
		where: { id: workspaceId, OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
		select: { id: true, ownerId: true },
	});
	if (!workspace) {
		throw new Error("Workspace not found or permission denied");
	}
	return workspace;
}

async function assertSpaceAdmin(spaceId: string, userId: string) {
	const space = await prisma.space.findUnique({
		where: { id: spaceId },
		select: {
			id: true,
			name: true,
			createdBy: true,
			workspaceId: true,
			workspace: { select: { ownerId: true } },
		},
	});
	if (!space) throw new Error("Space not found");

	if (
		space.createdBy !== userId &&
		space.workspace.ownerId !== userId
	) {
		const membership = await prisma.spaceMember.findFirst({
			where: { spaceId, userId, role: "ADMIN" },
			select: { id: true },
		});
		if (!membership) throw new Error("Permission denied");
	}
	return space;
}

export const spaceRouter = router({
	list: protectedProcedure.input(listInputSchema).query(async ({ ctx, input }) => {
		const userId = ctx.session!.user!.id;

		const accessible: any = {
			OR: [
				{ createdBy: userId },
				{ members: { some: { userId } } },
				{ workspace: { ownerId: userId } },
				{ workspace: { members: { some: { userId } } } },
			],
		};

		const where: any = { ...accessible };

		if (input.scope === "owned") {
			where.createdBy = userId;
		} else if (input.scope === "member") {
			where.members = { some: { userId } };
		}

		if (input.workspaceId) {
			where.workspaceId = input.workspaceId;
		}

		if (input.status) {
			where.isActive = input.status === "active";
		}

		if (input.query) {
			const term = input.query.trim();
			where.OR = [
				...(where.OR || []),
				{ name: { contains: term, mode: "insensitive" } },
				{ description: { contains: term, mode: "insensitive" } },
			];
		}

		const skip = (input.page - 1) * input.pageSize;
		const take = input.pageSize;

		const include: any = {
			workspace: { select: { id: true, name: true } },
		};

		if (input.includeCounts) {
			include._count = {
				select: {
					members: true,
					tools: true,
					materials: true,
					lists: true,
				},
			};
		}

		const [total, items] = await Promise.all([
			prisma.space.count({ where }),
			prisma.space.findMany({
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

	create: protectedProcedure.input(createInputSchema).mutation(async ({ ctx, input }) => {
		const userId = ctx.session!.user!.id;
		await assertWorkspaceAccess(input.workspaceId, userId);

		const space = await prisma.space.create({
			data: {
				name: input.name,
				description: input.description ?? undefined,
				isActive: input.isActive ?? true,
				workspaceId: input.workspaceId,
				createdBy: userId,
				triggerType: "TIME_BASED",
				triggerConfig: {},
				actions: [],
				members: {
					create: {
						userId,
						role: "ADMIN",
					},
				},
			},
			include: {
				workspace: { select: { id: true, name: true } },
				_count: { select: { members: true, tools: true, materials: true, lists: true } },
			},
		});

		return space;
	}),

	get: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session!.user!.id;

		const space = await prisma.space.findFirst({
			where: {
				id: input.id,
				OR: [
					{ createdBy: userId },
					{ members: { some: { userId } } },
					{ workspace: { ownerId: userId } },
					{ workspace: { members: { some: { userId } } } },
				],
			},
			include: {
				workspace: {
					select: { id: true, name: true, ownerId: true },
				},
				members: {
					orderBy: { addedAt: "asc" },
					select: {
						id: true,
						role: true,
						user: { select: { id: true, name: true, email: true, image: true } },
					},
				},
				projects: {
					orderBy: { updatedAt: "desc" },
					select: {
						id: true,
						name: true,
						description: true,
						status: true,
						updatedAt: true,
					},
				},
				teams: {
					orderBy: { updatedAt: "desc" },
					select: {
						id: true,
						name: true,
						description: true,
						teamType: true,
						isActive: true,
						updatedAt: true,
					},
				},
				tools: {
					orderBy: { updatedAt: "desc" },
					select: {
						id: true,
						name: true,
						description: true,
						category: true,
						productUrl: true,
						isPublic: true,
						updatedAt: true,
					},
				},
				materials: {
					orderBy: { updatedAt: "desc" },
					select: {
						id: true,
						title: true,
						description: true,
						category: true,
						priceUsd: true,
						isPublic: true,
						externalUrl: true,
						fileUrl: true,
						updatedAt: true,
					},
				},
				lists: {
					orderBy: { position: "asc" },
					select: { id: true, name: true, description: true, color: true, icon: true },
				},
				folders: {
					orderBy: { position: "asc" },
					select: { id: true, name: true, description: true, color: true, icon: true },
				},
				_count: {
					select: { 
						members: true, 
						projects: true,
						teams: true,
						tools: true, 
						materials: true, 
						lists: true 
					},
				},
			},
		});

		return space;
	}),

	update: protectedProcedure.input(updateInputSchema).mutation(async ({ ctx, input }) => {
		const userId = ctx.session!.user!.id;
		const space = await assertSpaceAdmin(input.id, userId);

		const updated = await prisma.space.update({
			where: { id: space.id },
			data: {
				name: input.name ?? undefined,
				description: input.description ?? undefined,
				isActive: input.isActive ?? undefined,
			},
			include: {
				workspace: { select: { id: true, name: true } },
				_count: { select: { members: true, tools: true, materials: true, lists: true } },
			},
		});

		return updated;
	}),

	delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
		const userId = ctx.session!.user!.id;
		const space = await assertSpaceAdmin(input.id, userId);

		await prisma.spaceMember.deleteMany({ where: { spaceId: space.id } });
		await prisma.tool.updateMany({ where: { spaceId: space.id }, data: { spaceId: null } });
		await prisma.material.updateMany({ where: { spaceId: space.id }, data: { spaceId: null } });
		await prisma.folder.updateMany({ where: { spaceId: space.id }, data: { spaceId: null } });
		await prisma.list.updateMany({ where: { spaceId: space.id }, data: { spaceId: null } });

		return prisma.space.delete({ where: { id: space.id } });
	}),

	addMember: protectedProcedure.input(memberMutationSchema).mutation(async ({ ctx, input }) => {
		const userId = ctx.session!.user!.id;
		const space = await assertSpaceAdmin(input.spaceId, userId);

		// Ensure target user belongs to workspace
		const workspaceMember = await prisma.workspaceMember.findUnique({
			where: { workspaceId_userId: { workspaceId: space.workspaceId, userId: input.userId } },
			select: { id: true },
		});
		if (!workspaceMember) {
			throw new Error("User must be a member of the workspace before joining the space");
		}

		return prisma.spaceMember.upsert({
			where: { spaceId_userId: { spaceId: input.spaceId, userId: input.userId } },
			update: { role: input.role },
			create: { spaceId: input.spaceId, userId: input.userId, role: input.role },
		});
	}),

	removeMember: protectedProcedure
		.input(z.object({ spaceId: z.string(), userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session!.user!.id;
			await assertSpaceAdmin(input.spaceId, userId);

			await prisma.spaceMember.deleteMany({
				where: { spaceId: input.spaceId, userId: input.userId, role: { not: "ADMIN" } },
			});

			return { removed: true as const };
		}),
});


