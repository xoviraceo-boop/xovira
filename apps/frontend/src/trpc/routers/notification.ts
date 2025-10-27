import { z } from "zod";
import { protectedProcedure, router } from "@/trpc/init";
import { prisma } from "@/lib/prisma";

export const notificationRouter = router({
	// Get user notifications
	getNotifications: protectedProcedure
		.input(z.object({
			page: z.number().int().min(1).optional().default(1),
			pageSize: z.number().int().min(1).max(50).optional().default(20),
			unreadOnly: z.boolean().optional().default(false),
		}))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session!.user!.id;
			
			const where: any = { userId };
			if (input.unreadOnly) {
				where.isRead = false;
			}

			const skip = (input.page - 1) * input.pageSize;
			const take = input.pageSize;

			const [total, notifications] = await Promise.all([
				prisma.notification.count({ where }),
				prisma.notification.findMany({
					where,
					orderBy: { createdAt: "desc" },
					skip,
					take,
				}),
			]);

			return { notifications, total, page: input.page, pageSize: input.pageSize };
		}),

	// Get user notifications with infinite query support
	getNotificationsInfinite: protectedProcedure
		.input(z.object({
			pageSize: z.number().int().min(1).max(50).optional().default(10),
			unreadOnly: z.boolean().optional().default(false),
		}))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session!.user!.id;
			
			const where: any = { userId };
			if (input.unreadOnly) {
				where.isRead = false;
			}

			const take = input.pageSize;

			const [total, notifications] = await Promise.all([
				prisma.notification.count({ where }),
				prisma.notification.findMany({
					where,
					orderBy: { createdAt: "desc" },
					take,
				}),
			]);

			return { 
				notifications, 
				total, 
				page: 1, 
				pageSize: input.pageSize,
				hasNextPage: notifications.length === input.pageSize && notifications.length < total
			};
		}),

	// Mark notification as read
	markAsRead: protectedProcedure
		.input(z.object({ notificationId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session!.user!.id;
			
			const notification = await prisma.notification.update({
				where: {
					id: input.notificationId,
					userId,
				},
				data: {
					isRead: true,
					readAt: new Date(),
				},
			});

			// Send notification to the original sender that their request was viewed
			if (notification.relatedType === "PROPOSAL" && notification.relatedId) {
				try {
					// Find the request to get the sender
					const request = await prisma.request.findFirst({
						where: {
							proposalId: notification.relatedId,
							message: notification.content,
						},
						select: { senderId: true }
					});

					if (request) {
						// Create notification for the sender
						const created = await prisma.notification.create({
							data: {
								userId: request.senderId,
								type: "REQUEST_STATUS",
								title: "Request Viewed",
								content: `Your request has been viewed by the proposal owner.`,
								relatedId: notification.relatedId,
								relatedType: "PROPOSAL",
							}
						});

						// Note: client will emit 'notification:send' to broadcast this in real time


					}
				} catch (error) {
					console.error("Failed to notify sender:", error);
				}
			}

			return notification;
		}),

	// Mark all notifications as read
	markAllAsRead: protectedProcedure
		.mutation(async ({ ctx }) => {
			const userId = ctx.session!.user!.id;
			
			await prisma.notification.updateMany({
				where: {
					userId,
					isRead: false,
				},
				data: {
					isRead: true,
					readAt: new Date(),
				},
			});

			return { success: true };
		}),

	// Get unread count
	getUnreadCount: protectedProcedure
		.query(async ({ ctx }) => {
			const userId = ctx.session!.user!.id;
			
			const count = await prisma.notification.count({
				where: {
					userId,
					isRead: false,
				},
			});

			return { count };
		}),

	// Delete notification
	deleteNotification: protectedProcedure
		.input(z.object({ notificationId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session!.user!.id;
			
			await prisma.notification.delete({
				where: {
					id: input.notificationId,
					userId,
				},
			});

			return { success: true };
		}),

	// Get notification by ID
	getNotification: protectedProcedure
		.input(z.object({ notificationId: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session!.user!.id;
			
			return prisma.notification.findFirst({
				where: {
					id: input.notificationId,
					userId,
				},
			});
		}),
});
