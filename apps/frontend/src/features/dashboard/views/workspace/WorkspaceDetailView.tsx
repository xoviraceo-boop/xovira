"use client";
import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CardSkeleton } from "@/components/ui/card.skeleton";
import WorkspaceSidebar from "@/features/dashboard/layouts/workspace/Sidebar";
import { useWorkspaceDetail } from "@/entities/workspace";
import { ChatView } from "@/features/dashboard/views/project/ChatView";
import type { ChatContextType } from "@/entities/chats/utils/context";

type Props = {
	workspaceId: string;
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

export default function WorkspaceDetailView({ workspaceId }: Props) {
	const { data, isLoading } = useWorkspaceDetail(workspaceId);

	const workspace = data ?? null;

	const stats = useMemo(() => {
		if (!workspace?._count) {
			return [];
		}
		return [
			{ label: "Spaces", value: workspace._count.spaces, accent: "from-sky-400 to-blue-500" },
			{ label: "Projects", value: workspace._count.projects, accent: "from-purple-400 to-indigo-500" },
			{ label: "Teams", value: workspace._count.teams, accent: "from-rose-400 to-pink-500" },
			{ label: "Members", value: workspace._count.members, accent: "from-emerald-400 to-teal-500" },
		];
	}, [workspace?._count]);

	const chatContextOptions = useMemo(() => {
		if (!workspace) return [];
		
		const options = [
			{
				label: `${workspace.name} (Workspace)`,
				value: "workspace" as ChatContextType,
				entityId: workspace.id,
				name: workspace.name ?? undefined,
			},
			...(workspace.spaces ?? []).map((space) => ({
				label: `${space.name} • Space`,
				value: "space" as ChatContextType,
				entityId: space.id,
				name: space.name ?? undefined,
			})),
			...(workspace.channels ?? []).map((channel) => ({
				label: `${channel.name} • Channel`,
				value: "channel" as ChatContextType,
				entityId: channel.id,
				name: channel.name ?? undefined,
			})),
			...(workspace.projects ?? []).map((project) => ({
				label: `${project.name} • Project`,
				value: "project" as ChatContextType,
				entityId: project.id,
				name: project.name ?? undefined,
			})),
			...(workspace.teams ?? []).map((team) => ({
				label: `${team.name} • Team`,
				value: "team" as ChatContextType,
				entityId: team.id,
				name: team.name ?? undefined,
			})),
		];

		return options;
	}, [workspace]);

	return (
		<div className="grid gap-6 xl:grid-cols-[320px_1fr]">
			<aside className="hidden xl:block">
				<WorkspaceSidebar workspace={workspace} />
			</aside>

			<div className="space-y-8">
				{/* Hero Section */}
				<section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-2xl">
					<div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-tr from-sky-500/20 via-cyan-500/10 to-indigo-500/0 blur-3xl" aria-hidden />
					<div className="relative flex flex-col gap-10 px-10 py-12 lg:flex-row lg:items-end lg:justify-between">
						<div className="space-y-4">
							<Badge variant="secondary" className="bg-white/10 text-white backdrop-blur-sm">
								Workspace
							</Badge>
							{isLoading ? (
								<div className="flex space-y-3">
									<CardSkeleton />
									<CardSkeleton  />
								</div>
							) : workspace ? (
								<>
									<h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
										{workspace.name}
									</h1>
									<p className="max-w-2xl text-base leading-relaxed text-slate-200 md:text-lg">
										{workspace.description || "A central hub that unites projects, teams, and resources."}
									</p>
								</>
							) : (
								<p className="text-sm text-slate-200">Workspace unavailable.</p>
							)}

							{workspace && (
								<div className="flex flex-wrap items-center gap-3 pt-2 text-sm text-slate-300">
									<span>
										Founded by <strong className="font-semibold text-white">{workspace.owner?.name ?? "Unknown"}</strong>
									</span>
									<Separator orientation="vertical" className="h-4 bg-white/30" />
									<span>{formatNumber(workspace._count?.members)} active members</span>
									<Separator orientation="vertical" className="h-4 bg-white/30" />
									<span>Updated {formatDate(workspace.updatedAt)}</span>
								</div>
							)}
						</div>
						<div className="flex flex-wrap gap-3">
							<Button variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
								<Link href="/dashboard/spaces">Explore spaces</Link>
							</Button>
							<Button className="bg-white text-slate-900 hover:bg-slate-100">
								<Link href="/dashboard/workspaces">Workspace overview</Link>
							</Button>
						</div>
					</div>
					
					{/* Stats Section */}
					<div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
						<div className="grid gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-4">
							{isLoading
								? Array.from({ length: 4 }).map((_, idx) => <CardSkeleton key={idx} />)
								: stats.map((stat) => (
										<div
											key={stat.label}
											className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur transition hover:scale-105 hover:border-white/20 hover:bg-white/10"
										>
											<div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 transition-opacity group-hover:opacity-10`} />
											<p className="relative text-xs font-medium uppercase tracking-wider text-white/70">{stat.label}</p>
											<p className="relative mt-2 text-3xl font-bold text-white">{formatNumber(stat.value)}</p>
										</div>
								  ))}
						</div>
					</div>
				</section>

				{/* Content Grid */}
				<div className="grid gap-6 lg:grid-cols-2">
					{/* Active Channels */}
					<Card className="border-slate-200 shadow-sm transition-all hover:shadow-md">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<span className="text-lg">Active channels</span>
								<Badge variant="outline" className="text-xs">{workspace?.channels?.length || 0}</Badge>
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								Where conversations, huddles, and quick updates live.
							</p>
						</CardHeader>
						<CardContent className="space-y-3">
							{workspace?.channels?.length ? (
								workspace.channels.map((channel) => (
									<div key={channel.id} className="group rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
										<div className="flex items-center justify-between">
											<div className="min-w-0 flex-1">
												<p className="text-sm font-semibold text-foreground">{channel.name}</p>
												<p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
													{channel.description ?? "Discussion channel"}
												</p>
											</div>
											<Badge variant="secondary" className="ml-3 shrink-0 text-xs">
												{formatNumber(channel._count?.tasks)} tasks
											</Badge>
										</div>
									</div>
								))
							) : (
								<div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
									<p className="text-sm text-muted-foreground">No channels yet. Create one to kickstart collaboration.</p>
								</div>
							)}
						</CardContent>
						<CardFooter className="justify-end border-t bg-slate-50/50 pt-4">
							<Button variant="outline">
								<Link href="/dashboard/channels">Manage channels</Link>
							</Button>
						</CardFooter>
					</Card>

					{/* Spaces */}
					<Card className="border-slate-200 shadow-sm transition-all hover:shadow-md">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<span className="text-lg">Spaces</span>
								<Badge variant="outline" className="text-xs">{workspace?.spaces?.length || 0}</Badge>
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								Collections of projects, assets, and knowledge tailored for specific teams.
							</p>
						</CardHeader>
						<CardContent className="space-y-3">
							{workspace?.spaces?.length ? (
								workspace.spaces.map((space) => (
									<Link
										key={space.id}
										href={`/dashboard/spaces/${space.id}`}
										className="block rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 transition hover:scale-[1.02] hover:border-slate-300 hover:bg-white hover:shadow-md"
									>
										<div className="flex items-center justify-between gap-3">
											<div className="min-w-0 flex-1">
												<p className="text-sm font-semibold text-foreground">{space.name}</p>
												<p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
													{space.description || "A focused area for boards, lists, and documentation."}
												</p>
											</div>
											<Badge variant={space.isActive ? "default" : "secondary"} className="shrink-0">
												{space.isActive ? "Active" : "Archived"}
											</Badge>
										</div>
										<div className="mt-3 flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
											<span className="flex items-center gap-1">
												<span className="text-foreground">{formatNumber(space._count?.members)}</span> members
											</span>
											<span className="flex items-center gap-1">
												<span className="text-foreground">{formatNumber(space._count?.tools)}</span> tools
											</span>
											<span className="flex items-center gap-1">
												<span className="text-foreground">{formatNumber(space._count?.materials)}</span> materials
											</span>
										</div>
									</Link>
								))
							) : (
								<div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
									<p className="text-sm text-muted-foreground">No spaces yet. Organize your work by creating one.</p>
								</div>
							)}
						</CardContent>
						<CardFooter className="justify-end border-t bg-slate-50/50 pt-4">
							<Button variant="outline">
								<Link href="/dashboard/spaces">View all spaces</Link>
							</Button>
						</CardFooter>
					</Card>

					{/* Project Landscape */}
					<Card className="border-slate-200 shadow-sm transition-all hover:shadow-md">
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center gap-2 text-lg font-semibold">
								<span>Project landscape</span>
								<Badge variant="outline" className="text-xs">{workspace?.projects?.length || 0}</Badge>
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								A pulse on the initiatives inside this workspace.
							</p>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							{workspace?.projects?.length ? (
								workspace.projects.map((project) => (
									<Link
										key={project.id}
										href={`/dashboard/projects/${project.id}`}
										className="group rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 transition hover:scale-[1.02] hover:border-slate-300 hover:shadow-lg"
									>
										<div className="flex items-start justify-between gap-2">
											<p className="text-sm font-semibold text-foreground line-clamp-1">{project.name}</p>
											<Badge variant="secondary" className="shrink-0 text-xs group-hover:bg-slate-200">
												{project.status ?? "DRAFT"}
											</Badge>
										</div>
										<p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
											{project.description || "No description available."}
										</p>
										<div className="mt-3 text-xs font-medium text-muted-foreground">
											Updated {formatDate(project.updatedAt)}
										</div>
									</Link>
								))
							) : (
								<div className="sm:col-span-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
									<p className="text-sm text-muted-foreground">
										No projects yet. Start from the projects dashboard to define goals.
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Team Movements */}
					<Card className="border-slate-200 shadow-sm transition-all hover:shadow-md">
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center gap-2 text-lg font-semibold">
								<span>Team movements</span>
								<Badge variant="outline" className="text-xs">{workspace?.teams?.length || 0}</Badge>
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								Your squads, roles, and hiring snapshots.
							</p>
						</CardHeader>
						<CardContent className="grid gap-4 sm:grid-cols-2">
							{workspace?.teams?.length ? (
								workspace.teams.map((team) => (
									<Link
										key={team.id}
										href={`/dashboard/teams/${team.id}`}
										className="group rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 transition hover:scale-[1.02] hover:border-slate-300 hover:shadow-lg"
									>
										<div className="flex items-start justify-between gap-2">
											<p className="text-sm font-semibold text-foreground line-clamp-1">{team.name}</p>
											<Badge variant="secondary" className="shrink-0 text-xs">{team.status ?? "DRAFT"}</Badge>
										</div>
										<p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
											{team.description || "Team details not provided yet."}
										</p>
										<div className="mt-3 text-xs font-medium text-muted-foreground">
											<span className="text-foreground">{formatNumber(team.size)}</span> members • Updated {formatDate(team.updatedAt)}
										</div>
									</Link>
								))
							) : (
								<div className="sm:col-span-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
									<p className="text-sm text-muted-foreground">No teams found yet.</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Resource Library */}
					<Card className="border-slate-200 shadow-sm transition-all hover:shadow-md lg:col-span-2">
						<CardHeader className="pb-4">
							<CardTitle className="text-lg font-semibold">Resource library</CardTitle>
							<p className="text-sm text-muted-foreground">
								The tools and materials curated inside this workspace.
							</p>
						</CardHeader>
						<CardContent className="grid gap-6 lg:grid-cols-2">
							{/* Tools */}
							<div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-white p-5 shadow-sm">
								<div className="flex items-center justify-between">
									<p className="text-base font-semibold text-foreground">Tools</p>
									<Badge variant="outline" className="text-sm">{formatNumber(workspace?._count?.tools)}</Badge>
								</div>
								<div className="mt-4 space-y-2">
									{workspace?.tools?.length ? (
										workspace.tools.slice(0, 5).map((tool) => (
											<div key={tool.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-sm shadow-sm transition hover:border-slate-300 hover:shadow">
												<div className="min-w-0 flex-1">
													<p className="truncate font-semibold text-foreground">{tool.name}</p>
													<p className="truncate text-xs text-muted-foreground">{tool.category}</p>
												</div>
												<Badge variant={tool.isPublic ? "default" : "secondary"} className="ml-3 shrink-0 text-xs">
													{tool.isPublic ? "Public" : "Private"}
												</Badge>
											</div>
										))
									) : (
										<div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
											<p className="text-sm text-muted-foreground">No tools catalogued yet.</p>
										</div>
									)}
								</div>
							</div>

							{/* Materials */}
							<div className="rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50/50 to-white p-5 shadow-sm">
								<div className="flex items-center justify-between">
									<p className="text-base font-semibold text-foreground">Materials</p>
									<Badge variant="outline" className="text-sm">{formatNumber(workspace?._count?.materials)}</Badge>
								</div>
								<div className="mt-4 space-y-2">
									{workspace?.materials?.length ? (
										workspace.materials.slice(0, 5).map((material) => (
											<div key={material.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2.5 text-sm shadow-sm transition hover:border-slate-300 hover:shadow">
												<div className="min-w-0 flex-1">
													<p className="truncate font-semibold text-foreground">{material.title}</p>
													<p className="truncate text-xs text-muted-foreground">
														{material.category} • ${material.priceUsd?.toFixed(0) ?? "0"}
													</p>
												</div>
												<Badge variant={material.isPublic ? "default" : "secondary"} className="ml-3 shrink-0 text-xs">
													{material.isPublic ? "Public" : "Private"}
												</Badge>
											</div>
										))
									) : (
										<div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
											<p className="text-sm text-muted-foreground">No materials published yet.</p>
										</div>
									)}
								</div>
							</div>
						</CardContent>
						<CardFooter className="justify-end gap-2 border-t bg-slate-50/50 pt-4">
							<Button variant="outline">
								<Link href="/dashboard/tools">View tools</Link>
							</Button>
							<Button variant="outline">
								<Link href="/dashboard/materials">View materials</Link>
							</Button>
						</CardFooter>
					</Card>

					{/* AI Assistant */}
					<Card className="border-slate-200 shadow-sm transition-all hover:shadow-md lg:col-span-2">
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center gap-2 text-lg font-semibold">
								<span>AI workspace assistant</span>
								<Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100 text-xs">AI-Powered</Badge>
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								Ask questions, summarize progress, or plan next steps with contextual awareness across your workspace.
							</p>
						</CardHeader>
						<CardContent>
							<ChatView
								contextType="WORKSPACE"
								contextId={workspace?.id}
								contextName={workspace?.name}
								contextOptions={chatContextOptions}
							/>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}