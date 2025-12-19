export type TaskListItem = {
	id: string;
	title: string;
	description?: string | null;
	status?: string | null;
	visibility?: string | null;
	isPublic?: boolean | null;
	workspaceId?: string | null;
	channelId?: string | null;
	projectId?: string | null;
	teamId?: string | null;
	assigneeId?: string | null;
	updatedAt?: string | Date | null;
	project?: { id: string; name: string | null } | null;
	team?: { id: string; name: string | null } | null;
	channel?: { id: string; name: string | null } | null;
	assignee?: { id: string; name: string | null; email: string | null } | null;
};



