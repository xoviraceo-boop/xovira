"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NavigationSidebar, { type WorkspaceView } from "@/features/dashboard/layouts/workspace/NavigationSidebar";
import WorkspaceOverviewView from "./WorkspaceOverviewView";
import SpacesView from "./SpacesView";
import WorkspaceChatView from "./WorkspaceChatView";
import WorkspaceAIChatView from "./WorkspaceAIChatView";

interface WorkspaceViewProps {
	workspaceId: string;
}

export default function WorkspaceView({ workspaceId }: WorkspaceViewProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const activeView = (searchParams.get("view") as WorkspaceView) || "overview";
	const selectedSpaceId = searchParams.get("spaceId") || undefined;
	const selectedChatId = searchParams.get("chatId") || undefined;
	const selectedAIChatId = searchParams.get("aiChatId") || undefined;
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	const handleViewChange = (view: WorkspaceView) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", view);
		// Clear spaceId when switching away from spaces view
		if (view !== "spaces") {
			params.delete("spaceId");
		}
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleSpaceSelect = (spaceId: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", "spaces");
		params.set("spaceId", spaceId);
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleChatSelect = (chatId: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", "chats");
		params.set("chatId", chatId);
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleAIChatSelect = (aiChatId: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("view", "ai-chat");
		params.set("aiChatId", aiChatId);
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const renderContent = () => {
		switch (activeView) {
			case "overview":
				return <WorkspaceOverviewView workspaceId={workspaceId} />;
			case "spaces":
				return (
					<SpacesView
						workspaceId={workspaceId}
						selectedSpaceId={selectedSpaceId}
						onSpaceSelect={handleSpaceSelect}
					/>
				);
			case "chats":
				return (
					<WorkspaceChatView
						workspaceId={workspaceId}
						selectedChatId={selectedChatId}
						onChatSelect={handleChatSelect}
					/>
				);
			case "ai-chat":
				return (
					<WorkspaceAIChatView
						workspaceId={workspaceId}
						selectedAIChatId={selectedAIChatId}
						onAIChatSelect={handleAIChatSelect}
					/>
				);
			default:
				return <WorkspaceOverviewView workspaceId={workspaceId} />;
		}
	};

	return (
		<div className="flex h-full gap-6">
			{/* Navigation Sidebar */}
			<NavigationSidebar
				workspaceId={workspaceId}
				activeView={activeView}
				onViewChange={handleViewChange}
				collapsed={sidebarCollapsed}
				onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
			/>

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto">{renderContent()}</div>
		</div>
	);
}

