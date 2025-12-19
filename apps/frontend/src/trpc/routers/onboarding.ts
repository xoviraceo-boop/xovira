import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

export const onboardingRouter = router({
	get: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session!.user!.id;
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { onboardingCompleted: true, onboardingStep: true },
		});
		return user;
	}),

	update: protectedProcedure
		.input(
			z.object({
				completed: z.boolean().optional(),
				step: z.number().int().min(0).max(10).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session!.user!.id;
			const updated = await prisma.user.update({
				where: { id: userId },
				data: {
					onboardingCompleted: input.completed ?? undefined,
					onboardingStep: input.step ?? undefined,
				},
				select: { onboardingCompleted: true, onboardingStep: true },
			});
			return updated;
		}),
});


