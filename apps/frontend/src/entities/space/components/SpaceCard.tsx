"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { SpaceListItem } from "@/entities/space/types";

type Props = {
	item: SpaceListItem;
	onOpen?: (id: string) => void;
	onManage?: (id: string) => void;
};

export function SpaceCard({ item, onOpen, onManage }: Props) {
	const updatedAt = item.updatedAt ? new Date(item.updatedAt) : undefined;
	const counts = item._count ?? {};

	return (
		<Card className="flex h-full flex-col">
			<CardHeader className="space-y-3">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 space-y-1">
						<CardTitle className="truncate text-lg">{item.name}</CardTitle>
						{item.workspace && (
							<p className="text-xs text-muted-foreground">
								Workspace: <span className="font-medium text-foreground">{item.workspace.name}</span>
							</p>
						)}
					</div>
					<Badge variant={item.isActive ? "default" : "secondary"}>
						{item.isActive ? "Active" : "Archived"}
					</Badge>
				</div>
				{item.description && (
					<p className="line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
				)}
			</CardHeader>
			<CardContent className="flex flex-1 flex-col gap-4 text-xs">
				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-lg border bg-muted/30 px-3 py-2">
						<div className="text-muted-foreground">Members</div>
						<div className="text-base font-semibold">{counts.members ?? 0}</div>
					</div>
					<div className="rounded-lg border bg-muted/30 px-3 py-2">
						<div className="text-muted-foreground">Tools</div>
						<div className="text-base font-semibold">{counts.tools ?? 0}</div>
					</div>
					<div className="rounded-lg border bg-muted/30 px-3 py-2">
						<div className="text-muted-foreground">Materials</div>
						<div className="text-base font-semibold">{counts.materials ?? 0}</div>
					</div>
					<div className="rounded-lg border bg-muted/30 px-3 py-2">
						<div className="text-muted-foreground">Lists</div>
						<div className="text-base font-semibold">{counts.lists ?? 0}</div>
					</div>
				</div>
				{updatedAt && (
					<p className="text-xs text-muted-foreground">
						Updated {updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
					</p>
				)}
			</CardContent>
			<CardFooter className="flex gap-2">
				<Button className="flex-1" onClick={() => onOpen?.(item.id)}>
					View space
				</Button>
				<Button variant="outline" onClick={() => onManage?.(item.id)}>
					Manage
				</Button>
			</CardFooter>
		</Card>
	);
}


