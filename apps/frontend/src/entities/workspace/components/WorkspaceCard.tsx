"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type WorkspaceSummary = {
	id: string;
	name: string;
	description?: string | null;
	isActive?: boolean | null;
	updatedAt?: string | Date | null;
	_count?: {
		members?: number;
		projects?: number;
		teams?: number;
		tasks?: number;
		channels?: number;
	};
};

type Props = {
	item: WorkspaceSummary;
	onOpen?: (id: string) => void;
};

export function WorkspaceCard({ item, onOpen }: Props) {
	const updatedAt = item.updatedAt ? new Date(item.updatedAt) : undefined;

	return (
		<Card className="flex h-full flex-col">
			<CardHeader className="space-y-3">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 space-y-1.5">
						<CardTitle className="truncate text-lg font-semibold">{item.name}</CardTitle>
						{item.description && (
							<p className="line-clamp-2 text-sm text-muted-foreground">
								{item.description}
							</p>
						)}
					</div>
					<Badge variant={item.isActive ? "default" : "secondary"} className="whitespace-nowrap">
						{item.isActive ? "Active" : "Archived"}
					</Badge>
				</div>
				{updatedAt && (
					<p className="text-xs text-muted-foreground">
						Updated {updatedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
					</p>
				)}
			</CardHeader>
			<CardFooter className="flex flex-wrap gap-2">
				<Button className="flex-1" onClick={() => onOpen?.(item.id)}>
					View workspace
				</Button>
			</CardFooter>
		</Card>
	);
}



