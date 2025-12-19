"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, ExternalLink, ChevronRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useWorkspaceDetail } from "@/entities/workspace";
import { CreateSpaceModal } from "@/features/dashboard/components/modals/CreateSpaceModal";
import SpaceDetailView from "./SpaceDetailView";

interface SpacesViewProps {
	workspaceId: string;
	selectedSpaceId?: string;
	onSpaceSelect?: (spaceId: string) => void;
}

function formatNumber(value: number | null | undefined) {
	if (!value) return "0";
	return value.toLocaleString();
}

export default function SpacesView({ workspaceId, selectedSpaceId, onSpaceSelect }: SpacesViewProps) {
	const { data: workspace, isLoading } = useWorkspaceDetail(workspaceId);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	const spaces = workspace?.spaces ?? [];
	const activeSpaceId = selectedSpaceId;

	const handleSpaceClick = (spaceId: string) => {
		if (onSpaceSelect) {
			onSpaceSelect(spaceId);
		}
	};

	const handleCreateSuccess = (spaceId: string) => {
		handleSpaceClick(spaceId);
	};

	return (
		<div className="flex h-full gap-6">
			{/* Spaces Sidebar */}
			<aside className="w-80 shrink-0 border-r border-slate-200 bg-white">
				<div className="flex h-full flex-col">
					{/* Header */}
					<div className="border-b border-slate-200 px-4 py-4">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-foreground">Spaces</h2>
							<Badge variant="outline" className="text-xs">
								{spaces.length}
							</Badge>
						</div>
					</div>

					{/* Actions */}
					<div className="border-b border-slate-200 px-4 py-3">
						<div className="flex flex-col gap-2">
							<Button
								onClick={() => setCreateModalOpen(true)}
								className="w-full h-9 px-3 text-sm"
							>
								<Plus className="mr-2 h-4 w-4" />
								Create Space
							</Button>
							<Link href="/dashboard/spaces" className="flex items-center justify-center w-full">
								<Button
									variant="outline"
									className="w-full h-9 px-3 text-sm"
								>
									<ExternalLink className="mr-2 h-4 w-4" />
									View All Spaces
								</Button>
							</Link>
						</div>
					</div>

					{/* Spaces List */}
					<div className="flex-1 overflow-y-auto px-2 py-2">
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<p className="text-sm text-muted-foreground">Loading spaces...</p>
							</div>
						) : spaces.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 px-4 text-center">
								<FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
								<p className="text-sm font-medium text-foreground">No spaces yet</p>
								<p className="mt-1 text-xs text-muted-foreground">
									Create your first space to organize your work
								</p>
							</div>
						) : (
							<div className="space-y-1">
								{spaces.map((space) => {
									const isActive = activeSpaceId === space.id;
									return (
										<button
											key={space.id}
											onClick={() => handleSpaceClick(space.id)}
											className={cn(
												"group flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
												"hover:bg-slate-50",
												isActive && "bg-slate-100"
											)}
										>
											<div className="flex min-w-0 flex-1 flex-col gap-1">
												<div className="flex items-center gap-2">
													<p className="truncate text-sm font-semibold text-foreground">
														{space.name}
													</p>
													{!space.isActive && (
														<Badge variant="secondary" className="shrink-0 text-xs">
															Archived
														</Badge>
													)}
												</div>
												{space.description && (
													<p className="line-clamp-2 text-xs text-muted-foreground">
														{space.description}
													</p>
												)}
												<div className="flex items-center gap-3 text-xs text-muted-foreground">
													<span>{formatNumber(space._count?.members)} members</span>
													<span>•</span>
													<span>{formatNumber(space._count?.tools)} tools</span>
												</div>
											</div>
											<ChevronRight
												className={cn(
													"h-4 w-4 shrink-0 text-muted-foreground transition-transform",
													isActive && "translate-x-0.5"
												)}
											/>
										</button>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<div className="flex-1 overflow-hidden">
				{activeSpaceId ? (
					<SpaceDetailView spaceId={activeSpaceId} workspaceId={workspaceId} />
				) : (
					<div className="flex h-full items-center justify-center">
						<div className="text-center">
							<FolderKanban className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
							<p className="text-lg font-medium text-foreground">Select a space</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Choose a space from the sidebar to view its details
							</p>
						</div>
					</div>
				)}
			</div>

			<CreateSpaceModal
				workspaceId={workspaceId}
				open={createModalOpen}
				onOpenChange={setCreateModalOpen}
				onSuccess={handleCreateSuccess}
			/>
		</div>
	);
}

