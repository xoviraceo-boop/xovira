import { z } from "zod";

export const taskFormSchema = z.object({
	id: z.string().optional(),
	title: z
		.string({ message: "Task title is required" })
		.min(3, "Task title must be at least 3 characters"),
	description: z.string().max(2000, "Description should be shorter than 2000 characters").optional().nullable(),
	status: z
		.enum(["OPEN", "IN_PROGRESS", "COMPLETED", "BLOCKED"])
		.default("OPEN")
		.optional(),
	visibility: z.enum(["PRIVATE", "TEAM", "WORKSPACE", "PUBLIC"]).default("PRIVATE"),
	isPublic: z.boolean().default(false),
	workspaceId: z.string().optional().nullable(),
	spaceId: z.string().optional().nullable(),
	channelId: z.string().optional().nullable(),
	projectId: z.string().optional().nullable(),
	teamId: z.string().optional().nullable(),
	assigneeId: z.string().optional().nullable(),
	listId: z.string().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;


