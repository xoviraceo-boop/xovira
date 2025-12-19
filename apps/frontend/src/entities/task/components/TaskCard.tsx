"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type TaskSummary = {
	id: string;
	title: string;
	description?: string | null;
	status?: string | null;
	visibility?: string | null;
	isPublic?: boolean | null;
	project?: { id: string; name: string | null } | null;
	team?: { id: string; name: string | null } | null;
	channel?: { id: string; name: string | null } | null;
	assignee?: { id: string; name: string | null; email: string | null } | null;
	updatedAt?: string | Date | null;
};

type Props = {
	item: TaskSummary;
	onOpen?: (id: string) => void;
	onConvert?: (id: string) => void;
};

const statusColors: Record<string, string> = {
	OPEN: "bg-blue-500/10 text-blue-600",
	"IN_PROGRESS": "bg-amber-500/10 text-amber-600",
	COMPLETED: "bg-emerald-500/10 text-emerald-600",
	BLOCKED: "bg-red-500/10 text-red-600",
};

export function TaskCard({ item, onOpen, onConvert }: Props) {
	const statusClass = statusColors[item.status ?? ""] ?? "bg-muted text-muted-foreground";
	const updatedAt = item.updatedAt ? new Date(item.updatedAt) : undefined;

	return (
		<Card className="flex h-full flex-col">
			<CardHeader className="space-y-3">
				<div className="flex items-start justify-between gap-4">
					<CardTitle className="min-w-0 truncate text-lg">{item.title}</CardTitle>
					<div className="flex flex-col items-end gap-2">
						<Badge className={statusClass}>{item.status ?? "OPEN"}</Badge>
						{item.visibility && (
							<span className="text-xs uppercase tracking-wide text-muted-foreground">{item.visibility}</span>
						)}
					</div>
				</div>
				{item.description && (
					<p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
				)}
			</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-4 text-xs">
				<div className="grid grid-cols-2 gap-3">
					{item.project && (
						<div className="rounded-md border bg-muted/30 px-3 py-2">
							<div className="text-muted-foreground">Project</div>
							<div className="truncate font-medium">{item.project.name}</div>
						</div>
					)}
					{item.team && (
						<div className="rounded-md border bg-muted/30 px-3 py-2">
							<div className="text-muted-foreground">Team</div>
							<div className="truncate font-medium">{item.team.name}</div>
						</div>
					)}
					{item.channel && (
						<div className="rounded-md border bg-muted/30 px-3 py-2">
							<div className="text-muted-foreground">Channel</div>
							<div className="truncate font-medium">#{item.channel.name}</div>
						</div>
					)}
					<div className="rounded-md border bg-muted/30 px-3 py-2">
						<div className="text-muted-foreground">Assignee</div>
						<div className="truncate font-medium">
							{item.assignee?.name ?? item.assignee?.email ?? "Unassigned"}
						</div>
					</div>
				</div>
				{updatedAt && (
					<p className="text-xs text-muted-foreground">
						Last updated {updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
					</p>
				)}
			</CardContent>
			<CardFooter className="flex gap-2">
				<Button className="flex-1" onClick={() => onOpen?.(item.id)}>
					View details
				</Button>
				<Button variant="outline" onClick={() => onConvert?.(item.id)}>
					Convert to proposal
				</Button>
			</CardFooter>
		</Card>
	);
}



