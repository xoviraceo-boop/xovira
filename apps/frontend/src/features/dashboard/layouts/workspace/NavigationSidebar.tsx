"use client";

import { useMemo } from "react";
import {
	LayoutDashboard,
	FolderKanban,
	MessageSquare,
	Sparkles,
	ChevronLeft,
	ChevronRight,
	Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceView = "overview" | "spaces" | "chats" | "ai-chat";

interface NavigationSidebarProps {
	workspaceId: string;
	activeView: WorkspaceView;
	onViewChange: (view: WorkspaceView) => void;
	mode?: "inline" | "overlay";
	onClose?: () => void;
	collapsed?: boolean;
	onToggleCollapse?: () => void;
}

const navigationItems: Array<{
	id: WorkspaceView;
	label: string;
	icon: React.ComponentType<{ className?: string; size?: number }>;
}> = [
	{ id: "overview", label: "Overview", icon: LayoutDashboard },
	{ id: "spaces", label: "Spaces", icon: FolderKanban },
	{ id: "chats", label: "Chats", icon: MessageSquare },
	{ id: "ai-chat", label: "AI Chat", icon: Sparkles },
];

export default function NavigationSidebar({
	workspaceId,
	activeView,
	onViewChange,
	mode = "inline",
	onClose,
	collapsed = false,
	onToggleCollapse,
}: NavigationSidebarProps) {
	return (
		<aside
			className={cn(
				"relative flex flex-col border-r border-slate-200 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white transition-all duration-300 shadow-xl",
				collapsed ? "w-16" : "w-72",
				mode === "overlay" ? "h-full" : "min-h-screen"
			)}
		>
			<div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-500 via-cyan-400 to-blue-500 opacity-60" />

			{/* Header */}
			<div className="flex items-center justify-between border-b border-white/10 px-4 py-4 backdrop-blur">
				{!collapsed && <h2 className="text-lg font-semibold">Workspace</h2>}
				<div className="flex items-center gap-2">
					{mode === "overlay" && (
						<button
							aria-label="Close sidebar"
							onClick={onClose}
							className="rounded-lg border border-white/20 p-2 transition-colors hover:bg-white/10"
						>
							<Menu size={18} />
						</button>
					)}
					{onToggleCollapse && (
						<button
							aria-label="Toggle sidebar"
							onClick={onToggleCollapse}
							className="rounded-lg border border-white/20 p-2 transition-colors hover:bg-white/10"
						>
							{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
						</button>
					)}
				</div>
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto px-4 py-4">
				<div className="space-y-1">
					{navigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeView === item.id;
						return (
							<button
								key={item.id}
								onClick={() => onViewChange(item.id)}
								className={cn(
									"flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
									"hover:bg-white/10",
									isActive
										? "bg-white/15 text-white shadow-sm"
										: "text-white/80",
									collapsed && "justify-center"
								)}
								title={collapsed ? item.label : undefined}
							>
								<Icon size={20} className="shrink-0" />
								{!collapsed && <span>{item.label}</span>}
							</button>
						);
					})}
				</div>
			</nav>
		</aside>
	);
}

