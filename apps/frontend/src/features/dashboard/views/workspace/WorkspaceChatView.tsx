"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, UserPlus, Hash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
 
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { VerticalToolRail } from "@/features/dashboard/components/VerticalToolRail";
import { useChannels } from "@/entities/channels/hooks/useChannels";
import { ChannelMessageComposer } from "@/entities/channels/components/ChannelMessageComposer";
import ChatCreationModal from "@/entities/channels/components/ChatCreationModal";
import ChannelList from "@/entities/channels/components/ChannelList";
import ChannelMessageList from "@/entities/channels/components/ChannelMessageList";
import ChannelAddMembersSidebar from "@/entities/channels/components/ChannelAddMembersSidebar";
import ChannelMembersSidebar from "@/entities/channels/components/ChannelMembersSidebar";
import ChannelSettingsSidebar from "@/entities/channels/components/ChannelSettingsSidebar";

interface WorkspaceChatViewProps {
	workspaceId: string;
	selectedChatId?: string;
	onChatSelect?: (chatId: string) => void;
}

type MemberSource = "workspace" | "project" | "team" | "space";

interface SelectedMember {
	id: string;
	name: string;
	email?: string;
	image?: string;
	source: MemberSource;
	sourceName?: string;
}

interface GroupOption {
	id: string;
	name: string;
	type: "project" | "team" | "space";
	members: SelectedMember[];
}

function dedupeMembers(list: SelectedMember[]): SelectedMember[] {
	const map = new Map<string, SelectedMember>();
	list.forEach((member) => {
		if (!map.has(member.id)) map.set(member.id, member);
	});
	return Array.from(map.values());
}
 

export default function WorkspaceChatView({ workspaceId, selectedChatId, onChatSelect }: WorkspaceChatViewProps) {
    const { data: workspace, isLoading } = trpc.workspace.get.useQuery({ id: workspaceId });
    const channelsQuery = trpc.channel.list.useQuery({ workspaceId, withCounts: false });
    const utils = trpc.useUtils();
    const createChannel = trpc.channel.create.useMutation();
    const updateChannel = trpc.channel.update.useMutation();
    const [activeChannelId, setActiveChannelId] = useState<string | null>(selectedChatId || null);
    const [addSidebarOpen, setAddSidebarOpen] = useState(false);
    const [membersSidebarOpen, setMembersSidebarOpen] = useState(false);
    const [settingsSidebarOpen, setSettingsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [stagedMembers, setStagedMembers] = useState<SelectedMember[]>([]);
    const [chatMembers, setChatMembers] = useState<SelectedMember[]>([]);
    const [chatTitle, setChatTitle] = useState<string>("");
    const [chatTopic, setChatTopic] = useState<string>("");
    const [chatDescription, setChatDescription] = useState<string>("");
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);

    const {
        messages,
        isLoading: isLoadingMessages,
        sendMessage,
    } = useChannels({ channelId: activeChannelId ?? undefined });

    const handleCreateChat = useCallback(async (title: string, topic?: string, description?: string) => {
        setIsCreatingConversation(true);
        try {
            const created = await createChannel.mutateAsync({ workspaceId, name: title, description });
            setActiveChannelId(created.id);
            setChatTitle(created.name ?? title);
            setChatDescription(created.description ?? description ?? "");
            setChatModalOpen(false);
            await utils.channel.list.invalidate({ workspaceId, withCounts: false });
        } finally {
            setIsCreatingConversation(false);
        }
    }, [createChannel, utils.channel.list, workspaceId]);

    const handleRename = useCallback(async (name: string) => {
        if (!activeChannelId) return;
        await updateChannel.mutateAsync({ id: activeChannelId, name, description: chatDescription || undefined });
        setChatTitle(name);
        await utils.channel.list.invalidate({ workspaceId, withCounts: false });
        setSettingsSidebarOpen(false);
    }, [activeChannelId, updateChannel, chatDescription, utils.channel.list, workspaceId]);

	useEffect(() => {
		if (selectedChatId) {
			setActiveChannelId(selectedChatId);
			const selectedChannel = channelsQuery.data?.find(c => c.id === selectedChatId);
			if (selectedChannel) {
				setChatTitle(selectedChannel.name ?? "Channel");
			}
		} else if (!activeChannelId && channelsQuery.data?.length) {
			setActiveChannelId(channelsQuery.data[0].id);
			setChatTitle(channelsQuery.data[0].name ?? "Channel");
		}
	}, [activeChannelId, channelsQuery.data, selectedChatId]);

	// Notify parent component when active channel changes
	useEffect(() => {
		if (activeChannelId && onChatSelect) {
			onChatSelect(activeChannelId);
		}
	}, [activeChannelId, onChatSelect]);

	useEffect(() => {
		if (!chatMembers.length && workspace?.members?.length) {
			const owner = workspace.members.find((m: any) => m.role === "OWNER") || workspace.members[0];
			if (owner?.user?.id) {
				setChatMembers([
					{
						id: owner.user.id,
						name: owner.user.name || "Owner",
						email: owner.user.email || undefined,
						image: owner.user.image || undefined,
						source: "workspace",
						sourceName: workspace.name,
					},
				]);
			}
		}
	}, [workspace, chatMembers.length]);

	const workspaceMembers = useMemo<SelectedMember[]>(() => {
		const members = (workspace?.members ?? [])
			.map((member: any) =>
				member?.user
					? {
							id: member.user.id,
							name: member.user.name || "Unknown",
							email: member.user.email || undefined,
							image: member.user.image || undefined,
							source: "workspace" as MemberSource,
							sourceName: workspace?.name,
					  }
					: null
			)
			.filter(Boolean) as SelectedMember[];
		return dedupeMembers(members);
	}, [workspace]);

const ownedProjects = trpc.project.list.useQuery({ scope: "owned", page: 1, pageSize: 50 });
const ownedTeams = trpc.team.list.useQuery({ scope: "owned", page: 1, pageSize: 50 });
const ownedSpaces = trpc.space.list.useQuery({ scope: "owned", page: 1, pageSize: 50 });

const projectGroups = useMemo(() => {
    return (ownedProjects.data?.items ?? []).map((p: any) => ({ id: p.id, name: p.name, type: "project" as const, members: [] as SelectedMember[] }));
}, [ownedProjects.data?.items]);

const teamGroups = useMemo(() => {
    return (ownedTeams.data?.items ?? []).map((t: any) => ({ id: t.id, name: t.name, type: "team" as const, members: [] as SelectedMember[] }));
}, [ownedTeams.data?.items]);

const spaceGroups = useMemo(() => {
    return (ownedSpaces.data?.items ?? []).map((s: any) => ({ id: s.id, name: s.name, type: "space" as const, members: [] as SelectedMember[] }));
}, [ownedSpaces.data?.items]);

	const allIndividuals = useMemo(() => dedupeMembers([...workspaceMembers]), [workspaceMembers]);

	const filteredIndividuals = useMemo(() => {
		if (!searchQuery.trim()) return allIndividuals;
		const q = searchQuery.toLowerCase();
		return allIndividuals.filter(
			(m) =>
				m.name.toLowerCase().includes(q) ||
				m.email?.toLowerCase().includes(q) ||
				m.sourceName?.toLowerCase().includes(q)
		);
	}, [allIndividuals, searchQuery]);

	const alreadyInChat = useCallback(
		(id: string) => chatMembers.some((m) => m.id === id) || stagedMembers.some((m) => m.id === id),
		[chatMembers, stagedMembers]
	);

	const groupOptions = useMemo(() => {
		const base = [...projectGroups, ...teamGroups, ...spaceGroups];
		return base.map((group) => ({
			...group,
			members: group.members.filter((m) => !alreadyInChat(m.id)),
		}));
	}, [projectGroups, teamGroups, spaceGroups, alreadyInChat]);

	const handleStageMember = (member: SelectedMember) => {
		if (alreadyInChat(member.id)) return;
		setStagedMembers((prev) => dedupeMembers([...prev, member]));
	};

const handleStageGroup = (members: SelectedMember[]) => {
    if (!members.length) return;
    setStagedMembers((prev) => dedupeMembers([...prev, ...members.filter((m) => !alreadyInChat(m.id))]));
};

const onIncludeGroup = useCallback(async (group: { id: string; name: string; type: "project" | "team" | "space" }) => {
    if (group.type === "project") {
        const res = await utils.project.getParticipants.fetch({ projectId: group.id });
        const members: SelectedMember[] = (res.users ?? []).map((u: any) => ({
            id: u.id,
            name: u.name || "Unknown",
            email: u.email || undefined,
            source: "project",
            sourceName: group.name,
        }));
        handleStageGroup(members);
    } else if (group.type === "team") {
        const res = await utils.team.getParticipants.fetch({ teamId: group.id });
        const members: SelectedMember[] = (res.users ?? []).map((u: any) => ({
            id: u.id,
            name: u.name || "Unknown",
            email: u.email || undefined,
            source: "team",
            sourceName: group.name,
        }));
        handleStageGroup(members);
    } else {
        const space = await utils.space.get.fetch({ id: group.id });
        const members: SelectedMember[] = (space.members ?? [])
            .map((m: any) => m.user ? ({
                id: m.user.id,
                name: m.user.name || "Unknown",
                email: m.user.email || undefined,
                image: m.user.image || undefined,
                source: "space" as const,
                sourceName: space.name,
            }) : null)
            .filter(Boolean) as SelectedMember[];
        handleStageGroup(members);
    }
}, [utils]);

	const commitMembers = () => {
		if (!stagedMembers.length) return;
		setChatMembers((prev) => dedupeMembers([...prev, ...stagedMembers]));
		setStagedMembers([]);
		setAddSidebarOpen(false);
	};

	const removeChatMember = (id: string) => {
		setChatMembers((prev) => prev.filter((m) => m.id !== id));
	};

	const removeStagedMember = (id: string) => {
		setStagedMembers((prev) => prev.filter((m) => m.id !== id));
	};

	const handleSendChannelMessage = useCallback(
		async (message: string, options?: { attachments?: any[] }) => {
			if (!activeChannelId) return;
			await sendMessage({
				channelId: activeChannelId,
				content: message,
				attachments: options?.attachments,
			});
		},
		[activeChannelId, sendMessage]
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<p className="text-sm text-muted-foreground">Loading chat...</p>
			</div>
		);
	}

	return (
		<div className="flex h-full bg-slate-50">
			{/* Left chat list */}
            <div className="hidden w-80 shrink-0 flex-col border-r bg-white lg:flex">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Channels</p>
                        <p className="text-xs text-muted-foreground">{workspace?.name}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setChatModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2">
                        <ChannelList
                            channels={(channelsQuery.data ?? []).map((c) => ({ id: c.id, name: c.name, description: c.description }))}
                            activeId={activeChannelId}
                            onSelect={(id) => {
                                const c = (channelsQuery.data ?? []).find((x) => x.id === id);
                                setActiveChannelId(id);
                                setChatTitle(c?.name ?? "Channel");
                            }}
                        />
                    </div>
                </ScrollArea>
			</div>

			{/* Main chat area */}
            <div className={cn("relative flex flex-1 flex-col overflow-hidden", {
                'lg:pr-[22rem]': addSidebarOpen || membersSidebarOpen || settingsSidebarOpen,
                'lg:pr-16': !addSidebarOpen && !membersSidebarOpen && !settingsSidebarOpen,
            })}
            >
				<div className="flex-1 flex flex-col bg-white border-x">
					<div className="border-b px-4 py-3">
						<p className="text-lg font-semibold">{chatTitle || "Channel"}</p>
						<p className="text-xs text-muted-foreground">Workspace channel messages</p>
					</div>
                    <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50">
                        {isLoadingMessages ? (
                            <p className="text-sm text-muted-foreground">Loading messages...</p>
                        ) : (
                            <ChannelMessageList messages={messages as any} onAddMembers={() => setAddSidebarOpen(true)} />
                        )}
                    </div>
					{activeChannelId && (
						<ChannelMessageComposer channelId={activeChannelId} />
					)}
				</div>

                <div className="flex items-center gap-2 border-t bg-white px-4 py-3 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{chatMembers.length} member{chatMembers.length === 1 ? "" : "s"}</span>
                </div>

				<VerticalToolRail
					onAddClick={() => setAddSidebarOpen(true)}
					onMembersClick={() => setMembersSidebarOpen(true)}
					onSettingsClick={() => setSettingsSidebarOpen(true)}
					className={cn({ "right-0": addSidebarOpen || membersSidebarOpen || settingsSidebarOpen })}
				/>

                <ChannelAddMembersSidebar
                    open={addSidebarOpen}
                    onClose={() => setAddSidebarOpen(false)}
                    searchQuery={searchQuery}
                    onSearchQuery={setSearchQuery}
                    stagedMembers={stagedMembers}
                    onRemoveStaged={removeStagedMember}
                    filteredIndividuals={filteredIndividuals}
                    alreadyInChat={alreadyInChat}
                    onStageMember={handleStageMember}
                    groupOptions={groupOptions.map((g) => ({ id: g.id, name: g.name, type: g.type, memberCount: undefined }))}
                    onIncludeGroup={onIncludeGroup}
                    onCommit={commitMembers}
                />

                <ChannelMembersSidebar
                    open={membersSidebarOpen}
                    onClose={() => setMembersSidebarOpen(false)}
                    chatMembers={chatMembers}
                    onRemoveMember={removeChatMember}
                />

                <ChannelSettingsSidebar
                    open={settingsSidebarOpen}
                    onClose={() => setSettingsSidebarOpen(false)}
                    chatTitle={chatTitle}
                    onChatTitle={setChatTitle}
                    chatTopic={chatTopic}
                    onChatTopic={setChatTopic}
                    chatDescription={chatDescription}
                    onChatDescription={setChatDescription}
                    onSave={() => handleRename(chatTitle)}
                />
			</div>

            <ChatCreationModal
                open={chatModalOpen}
                onOpenChange={setChatModalOpen}
                onCreate={handleCreateChat}
                isCreating={isCreatingConversation}
            />
		</div>
	);
}

