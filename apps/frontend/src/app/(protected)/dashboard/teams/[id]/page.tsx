"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import TeamForm from '@/entities/teams/components/TeamForm';
import ViewSwitcher from '@/features/dashboard/views/team/ViewSwitcher';
import PageHeader from '@/entities/shared/components/PageHeader';
import TeamActions from '@/entities/teams/components/TeamActions';
import { useToast } from "@/hooks/useToast";
import { useAppDispatch } from "@/hooks/useReduxStore";
import { upsertProposal } from "@/stores/slices/proposal.slice";
import { serializeDates } from "@/stores/utils/serialize";
import { ProposalIntent } from "@/entities/proposals/constants";
import { useTeamContext } from "./layout";
import { TEAM_PROPOSAL_TYPES } from '@/entities/teams/constants';

export default function TeamDetailPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const activeTab = searchParams.get('tab') || 'overview';

  // Get shared context from layout - no need to query again!
  const {
	teamData: team,
	isLoading,
	isPublished,
	isPublishing,
	handleTogglePublish,
	isOwner,
  } = useTeamContext();
  
  const [editing, setEditing] = useState(false);
  
  const createProposalMutation = trpc.proposal.create.useMutation();

  const handleToggleEdit = () => {
	if (!isOwner) return;
	setEditing((v) => !v);
  };

  const handleCreateProposal = async (type: string) => {
	if (!team?.id) {
	  toast({
		title: "Error",
		description: "Team not found. Please try again.",
		variant: "destructive",
	  });
	  return;
	}

	try {
	  const proposalType = PROJECT_PROPOSAL_TYPES.find((t) => t.value === type);

	  const category = proposalType?.category || 'GENERAL';
	  const title = proposalType?.label || 'Untitled Proposal';

	  const { id, data } = await createProposalMutation.mutateAsync({
		title,
		shortSummary: "",
		detailedDesc: "",
		category,
		intent: ProposalIntent.SEEKING,

		status: "DRAFT",
		teamId: team.id
	  } as any);

	  dispatch(upsertProposal({ id, data: serializeDates(data as any) }));
	  
	  toast({
		title: "Success",
		description: `${title} proposal created successfully.`,
	  });

	  router.push(`/dashboard/proposals/${id}?edit=1`);
	} catch (e) {
	  console.error("Failed to create proposal:", e);
	  toast({
		title: "Failed to create proposal",
		description: "An error occurred while creating your proposal. Please try again.",
		variant: "destructive",
	  });
	}
  };

  // Memoize header props
  const headerProps = useMemo(
	() => ({
	  title: team?.name || "Untitled Team",
	  subtitle: editing ? "Edit Mode" : "Team Details",
	  description: editing ? "Make changes to your team" : team?.description,
	}),
	[team?.name, team?.description, editing]
  );

  if (isLoading) {
	return (
	  <div className="flex items-center justify-center h-full py-20">
		<div className="text-center space-y-4">
		  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
		  <p className="text-muted-foreground">Loading team details...</p>
		</div>
	  </div>
	);
  }

  if (!team) {
	return (
	  <div className="flex items-center justify-center h-full py-20">
		<div className="text-center space-y-4">
		  <h2 className="text-2xl font-bold">Permission denied</h2>
		  <p className="text-muted-foreground">You are not a member of this team.</p>
		</div>
	  </div>
	);
  }

  return (
	<div className="flex flex-col h-full">
	  <PageHeader
		title={headerProps.title}
		subtitle={headerProps.subtitle}
		description={!editing ? headerProps.description : undefined}
		actions={
		  isOwner ? (
			<TeamActions
			  isEditing={editing}
			  isPublished={isPublished}
			  isPublishing={isPublishing}
			  onToggleEdit={handleToggleEdit}
			  onTogglePublish={handleTogglePublish}
			  onCreateProposal={handleCreateProposal}
			/>
		  ) : null
		}
	  />

	  <div className="flex-1 overflow-auto">
		<div className="w-full mx-auto px-6 py-8">
		  {editing ? (
			<div className="bg-card border rounded-lg shadow-sm">
			  <TeamForm teamId={team.id} mode="edit" />
			</div>
		  ) : (
			<ViewSwitcher 
			  activeTab={activeTab} 
			  team={team}
			/>
		  )}
		</div>
	  </div>
	</div>
  );
}