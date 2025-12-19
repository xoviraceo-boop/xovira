"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, X, FolderKanban, Users, FileText, CheckSquare, Hash, FileCheck, Wrench, Package } from "lucide-react";
import { VerticalToolRail } from "@/features/dashboard/components/VerticalToolRail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AddViewModal, ViewType } from "@/features/dashboard/components/modals/AddViewModal";
import { SpaceItemSidebar } from "@/features/dashboard/components/sidebar/SpaceItemSidebar";
import { SpaceSettingsSidebar } from "@/features/dashboard/components/sidebar/SpaceSettingsSidebar";
import { cn } from "@/lib/utils";

interface SpaceDetailViewProps {
	spaceId: string;
	workspaceId: string;
}

const defaultViews: ViewType[] = ["projects", "teams", "docs"];

const viewConfig: Record<
	ViewType,
	{
		label: string;
		icon: React.ComponentType<{ className?: string; size?: number }>;
		description: string;
	}
> = {
	projects: { label: "Projects", icon: FolderKanban, description: "View and manage projects" },
	teams: { label: "Teams", icon: Users, description: "View and manage teams" },
	docs: { label: "Docs", icon: FileText, description: "View and manage documents" },
	tasks: { label: "Tasks", icon: CheckSquare, description: "View and manage tasks" },
	channels: { label: "Channels", icon: Hash, description: "View and manage channels" },
	proposals: { label: "Proposals", icon: FileCheck, description: "View and manage proposals" },
	tools: { label: "Tools", icon: Wrench, description: "View and manage tools" },
	materials: { label: "Materials", icon: Package, description: "View and manage materials" },
};

function formatNumber(value: number | null | undefined) {
	if (!value) return "0";
	return value.toLocaleString();
}

function formatDate(input?: Date | string | null) {
	if (!input) return "—";
	const date = typeof input === "string" ? new Date(input) : input;
	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default function SpaceDetailView({ spaceId, workspaceId }: SpaceDetailViewProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: space, isLoading } = trpc.space.get.useQuery({ id: spaceId });
    const { data: workspace } = trpc.workspace.get.useQuery({ id: workspaceId });
	
	// Type assertion for space data that includes tools and materials
	const spaceWithTools = space as any;
	
	// Get projects and teams for this space from workspace
	// Note: workspace.get doesn't include spaceId, so we'll fetch them separately if needed
	// For now, we'll show all workspace projects/teams or fetch them via a separate query
    const spaceProjects = useMemo(() => {
        return (workspace?.projects ?? []).filter((p: any) => p.spaceId === spaceId);
    }, [workspace?.projects, spaceId]);

    const spaceTeams = useMemo(() => {
        return (workspace?.teams ?? []).filter((t: any) => t.spaceId === spaceId);
    }, [workspace?.teams, spaceId]);

	// Get active tab from URL, default to first view
	const urlTab = searchParams.get("tab") as ViewType | null;
	const [activeViews, setActiveViews] = useState<ViewType[]>(defaultViews);
	const activeTab = urlTab && activeViews.includes(urlTab) ? urlTab : activeViews[0];
    const [addViewModalOpen, setAddViewModalOpen] = useState(false);
    const [itemSidebarOpen, setItemSidebarOpen] = useState(false);
    const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false);

    const canAddForTab = (tab: ViewType) => ["projects", "teams", "tools", "materials"].includes(tab);
    const openItemSidebar = () => { if (canAddForTab(activeTab)) setItemSidebarOpen(true); };
    const openSettingsSidebar = () => setSettingsSidebarOpen(true);

    const utils = trpc.useUtils();
    const projectUpdate = trpc.project.update.useMutation({
        onSuccess: () => {
            utils.workspace.get.invalidate({ id: workspaceId });
            utils.space.get.invalidate({ id: spaceId });
            utils.project.list.invalidate();
        },
    });
    
    const teamUpdate = trpc.team.update.useMutation({
        onSuccess: () => {
            utils.workspace.get.invalidate({ id: workspaceId });
            utils.space.get.invalidate({ id: spaceId });
            utils.team.list.invalidate();
        },
    });
    
    const toolUpdate = trpc.tool.update.useMutation({
        onSuccess: () => {
            utils.workspace.get.invalidate({ id: workspaceId });
            utils.space.get.invalidate({ id: spaceId });
            utils.tool.list.invalidate();
        },
    });
    
    const materialUpdate = trpc.material.update.useMutation({
        onSuccess: () => {
            utils.workspace.get.invalidate({ id: workspaceId });
            utils.space.get.invalidate({ id: spaceId });
            utils.material.list.invalidate();
        },
    });

    const detachProject = async (id: string) => {
        try {
            await projectUpdate.mutateAsync({ 
                id, 
                spaceId: null,
                workspaceId: null 
            });
            toast.success('Project removed from space');
        } catch (error) {
            console.error('Failed to detach project:', error);
            toast.error('Failed to remove project from space');
        }
    };
    const detachTeam = async (id: string) => {
        try {
            await teamUpdate.mutateAsync({ 
                id, 
                spaceId: null,
                workspaceId: null 
            });
            toast.success('Team removed from space');
        } catch (error) {
            console.error('Failed to detach team:', error);
            toast.error('Failed to remove team from space');
        }
    };
    const detachTool = async (id: string) => {
        try {
            await toolUpdate.mutateAsync({ 
                id, 
                spaceId: null,
                workspaceId: null 
            });
            toast.success('Tool removed from space');
        } catch (error) {
            console.error('Failed to detach tool:', error);
            toast.error('Failed to remove tool from space');
        }
    };
    const detachMaterial = async (id: string) => {
        try {
            await materialUpdate.mutateAsync({ 
                id, 
                spaceId: null,
                workspaceId: null 
            });
            toast.success('Material removed from space');
        } catch (error) {
            console.error('Failed to detach material:', error);
            toast.error('Failed to remove material from space');
        }
    };

	// Sync activeViews to URL on mount if tab is in URL
	useEffect(() => {
		if (urlTab && !activeViews.includes(urlTab)) {
			setActiveViews((prev) => [...prev, urlTab]);
		}
	}, [urlTab, activeViews]);

	const handleTabChange = (tab: ViewType) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("tab", tab);
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleAddViews = (views: ViewType[]) => {
		setActiveViews((prev) => {
			const newViews = [...prev, ...views];
			// Set the first new view as active in URL
			if (views.length > 0) {
				handleTabChange(views[0]);
			}
			return newViews;
		});
	};

	const handleRemoveView = (viewId: ViewType) => {
		if (activeViews.length <= 1) {
			return; // Don't remove the last view
		}
		setActiveViews((prev) => {
			const newViews = prev.filter((v) => v !== viewId);
			// If the removed view was active, switch to the first remaining view
			if (activeTab === viewId) {
				handleTabChange(newViews[0]);
			}
			return newViews;
		});
	};

	const renderViewContent = (viewType: ViewType) => {
		switch (viewType) {
			case "projects":
				return (
					<div className="space-y-4">
                        {spaceProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 px-4 text-center">
                                <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-sm font-medium text-foreground">No projects yet</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Projects in this space will appear here
                                </p>
                                <Button variant="outline" size="sm" className="mt-3" onClick={openItemSidebar}>Add</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {spaceProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/dashboard/projects/${project.id}`}
                                        className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-semibold text-foreground line-clamp-1">
                                                {project.name}
                                            </p>
                                            <Badge variant="secondary" className="shrink-0 text-xs">
                                                {project.status ?? "DRAFT"}
                                            </Badge>
                                            <button
                                                className="ml-2 rounded p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                                onClick={(e) => { e.preventDefault(); detachProject(project.id); }}
                                                aria-label="Remove from space"
                                            >
                                                <X className="h-3 w-3 text-red-500" />
                                            </button>
                                        </div>
                                        {project.description && (
                                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="mt-3 text-xs text-muted-foreground">
                                            Updated {formatDate(project.updatedAt)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
						)}
					</div>
				);

			case "teams":
				return (
					<div className="space-y-4">
                        {spaceTeams.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 px-4 text-center">
                                <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-sm font-medium text-foreground">No teams yet</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Teams in this space will appear here
                                </p>
                                <Button variant="outline" size="sm" className="mt-3" onClick={openItemSidebar}>Add</Button>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {spaceTeams.map((team) => (
                                    <Link
                                        key={team.id}
                                        href={`/dashboard/teams/${team.id}`}
                                        className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-semibold text-foreground line-clamp-1">
                                                {team.name}
                                            </p>
                                            <Badge variant="secondary" className="shrink-0 text-xs">
                                                {team.status ?? "DRAFT"}
                                            </Badge>
                                            <button
                                                className="ml-2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                                                onClick={(e) => { e.preventDefault(); detachTeam(team.id); }}
                                                aria-label="Remove from space"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                        {team.description && (
                                            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                                {team.description}
                                            </p>
                                        )}
                                        <div className="mt-3 text-xs text-muted-foreground">
                                            {formatNumber(team.size)} members • Updated {formatDate(team.updatedAt)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
						)}
					</div>
				);

			case "docs":
				return (
					<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 px-4 text-center">
						<FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
						<p className="text-sm font-medium text-foreground">Documents view</p>
						<p className="mt-1 text-xs text-muted-foreground">
							Document management will be available here
						</p>
					</div>
				);

			case "tasks":
				return (
					<div className="space-y-4">
						<TaskView 
							context="SPACE" 
							contextId={spaceId}
							workspaceId={workspaceId}
						/>
					</div>
				);

			case "tools":
				return (
					<div className="space-y-4">
						{spaceWithTools?.tools && Array.isArray(spaceWithTools.tools) && spaceWithTools.tools.length > 0 ? (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{spaceWithTools.tools.map((tool: any) => (
                                    <Card key={tool.id} className="border-slate-200 relative">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">{tool.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {tool.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {tool.description}
                                                </p>
                                            )}
                                            <Badge variant={tool.isPublic ? "default" : "secondary"} className="mt-2 text-xs">
                                                {tool.isPublic ? "Public" : "Private"}
                                            </Badge>
                                            <button
                                                className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                                                onClick={() => detachTool(tool.id)}
                                                aria-label="Remove from space"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </CardContent>
                                    </Card>
                                ))}
							</div>
						) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 px-4 text-center">
                                <Wrench className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-sm font-medium text-foreground">No tools yet</p>
                                <Button variant="outline" size="sm" className="mt-3" onClick={openItemSidebar}>Add</Button>
                            </div>
						)}
					</div>
				);

			case "materials":
				return (
					<div className="space-y-4">
						{spaceWithTools?.materials && Array.isArray(spaceWithTools.materials) && spaceWithTools.materials.length > 0 ? (
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{spaceWithTools.materials.map((material: any) => (
                                    <Card key={material.id} className="border-slate-200 relative">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">{material.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {material.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {material.description}
                                                </p>
                                            )}
                                            <div className="mt-2 flex items-center justify-between">
                                                <Badge variant={material.isPublic ? "default" : "secondary"} className="text-xs">
                                                    {material.isPublic ? "Public" : "Private"}
                                                </Badge>
                                                {material.priceUsd && (
                                                    <span className="text-xs font-medium">${material.priceUsd.toFixed(0)}</span>
                                                )}
                                            </div>
                                            <button
                                                className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground hover:text-foreground"
                                                onClick={() => detachMaterial(material.id)}
                                                aria-label="Remove from space"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </CardContent>
                                    </Card>
                                ))}
							</div>
						) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 px-4 text-center">
                                <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-sm font-medium text-foreground">No materials yet</p>
                                <Button variant="outline" size="sm" className="mt-3" onClick={openItemSidebar}>Add</Button>
                            </div>
						)}
					</div>
				);

			default:
				return (
					<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 py-12 px-4 text-center">
						<p className="text-sm font-medium text-foreground">
							{viewConfig[viewType]?.label || viewType} view
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							This view is coming soon
						</p>
					</div>
				);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-sm text-muted-foreground">Loading space...</p>
			</div>
		);
	}

	if (!space) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-sm text-muted-foreground">Space not found</p>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b border-slate-200 bg-white px-6 py-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold text-foreground">{space.name}</h1>
						{space.description && (
							<p className="mt-1 text-sm text-muted-foreground">{space.description}</p>
						)}
					</div>
					<Badge variant={space.isActive ? "default" : "secondary"}>
						{space.isActive ? "Active" : "Archived"}
					</Badge>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex-1 overflow-hidden bg-slate-50">
				<Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as ViewType)} className="flex h-full flex-col">
					<div className="border-b border-slate-200 bg-white px-6">
						<div className="flex items-center justify-between">
							<TabsList className="h-auto bg-transparent p-0">
								{activeViews.map((viewId) => {
									const config = viewConfig[viewId];
									const Icon = config.icon;
									return (
										<TabsTrigger
										key={viewId}
										value={viewId}
										asChild
									>
										<div className="group relative flex items-center gap-2 data-[state=active]:bg-slate-100">
											<Icon className="h-4 w-4" />
											<span>{config.label}</span>
											{activeViews.length > 1 && (
												<button
													onClick={(e) => {
														e.stopPropagation();
														e.preventDefault();
														handleRemoveView(viewId);
													}}
													onMouseDown={(e) => e.stopPropagation()}
													className="ml-1 rounded p-0.5 opacity-0 transition-opacity hover:bg-slate-200 group-hover:opacity-100"
													aria-label={`Close ${config.label} tab`}
												>
													<X className="h-3 w-3" />
												</button>
											)}
										</div>
									</TabsTrigger>
									);
								})}
                            </TabsList>
                            <div className="flex items-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setAddViewModalOpen(true)}
                                    className="h-9 px-3 text-sm"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add View
                                </Button>
                                {/* Removed inline Add button per requirement */}
                            </div>
						</div>
					</div>

                    <div className={cn("relative flex-1 overflow-y-auto px-6 py-6", {
                        'lg:pr-[22rem]': itemSidebarOpen || settingsSidebarOpen,
                        'lg:pr-16': !itemSidebarOpen && !settingsSidebarOpen
                    })}>
                        {activeViews.map((viewId) => (
                            <TabsContent key={viewId} value={viewId} className="mt-0">
                                {renderViewContent(viewId)}
                            </TabsContent>
                        ))}
                        {/* Vertical tool rail */}
                        <VerticalToolRail 
                            onAddClick={openItemSidebar} 
                            onSettingsClick={openSettingsSidebar}
                            className={cn({
                                'right-0': itemSidebarOpen || settingsSidebarOpen,
                                'right-0': !itemSidebarOpen && !settingsSidebarOpen
                            })}
                        />
                        <SpaceItemSidebar spaceId={spaceId} workspaceId={workspaceId} type={activeTab} open={itemSidebarOpen} onClose={() => setItemSidebarOpen(false)} inline />
                        <SpaceSettingsSidebar spaceId={spaceId} workspaceId={workspaceId} open={settingsSidebarOpen} onClose={() => setSettingsSidebarOpen(false)} inline />
                    </div>
				</Tabs>
			</div>

			<AddViewModal
				open={addViewModalOpen}
				onOpenChange={setAddViewModalOpen}
				existingViews={activeViews}
				onAddViews={handleAddViews}
			/>
            
		</div>
	);
}

