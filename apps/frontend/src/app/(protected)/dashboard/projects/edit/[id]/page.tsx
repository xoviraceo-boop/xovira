"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import ProjectForm from '@/entities/projects/components/ProjectForm';
import PageHeader from '@/entities/shared/components/PageHeader';
import ProjectActions from '@/entities/projects/components/ProjectActions';
import { useToast } from "@/hooks/useToast";
import { useAppDispatch } from "@/hooks/useReduxStore";
import { upsertProposal } from "@/stores/slices/proposal.slice";
import { serializeDates } from "@/stores/utils/serialize";
import { ProposalIntent } from "@/entities/proposals/constants";
import { useProjectContext } from "./layout";
import { PROJECT_PROPOSAL_TYPES } from '@/entities/projects/constants';

export default function ProjectEditPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { toast } = useToast();

  const {
    projectData: project,
    isLoading,
    isPublished,
    isPublishing,
    handleTogglePublish,
    isOwner,
  } = useProjectContext();

  const createProposalMutation = trpc.proposal.create.useMutation();

  const handleCreateProposal = async (type: string) => {
    if (!project?.id) {
      toast({
        title: "Error",
        description: "Project not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const proposalType = PROJECT_PROPOSAL_TYPES.find((t) => t.value === type);

      const category = proposalType?.category || "GENERAL";
      const title = proposalType?.label || "Untitled Proposal";

      const { id, data } = await createProposalMutation.mutateAsync({
        title,
        shortSummary: "",
        detailedDesc: "",
        category,
        intent: ProposalIntent.SEEKING,
        status: "DRAFT",
        projectId: project.id,
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

  // --- FIX: memo props now valid ---
  const headerProps = useMemo(
    () => ({
      title: project?.name || "Untitled Project",
      subtitle: "Edit Mode",
      description: "Make changes to your project",
    }),
    [project?.name, project?.description]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Not exist</h2>
          <p className="text-muted-foreground">This project does not exist.</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Permission denied</h2>
          <p className="text-muted-foreground">You are not owner of this project.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={headerProps.title}
        subtitle={headerProps.subtitle}
        description={headerProps.description}
        actions={
          <ProjectActions
            isEditing={true}
            isPublished={isPublished}
            isPublishing={isPublishing}
            onToggleEdit={handleTogglePublish}
            onTogglePublish={handleTogglePublish}
            onCreateProposal={handleCreateProposal}
          />
        }
      />

      <div className="flex-1 overflow-auto">
        <div className="w-full mx-auto px-6 py-8">
          <div className="bg-card border rounded-lg shadow-sm">
            <ProjectForm projectId={project.id} mode="edit" />
          </div>
        </div>
      </div>
    </div>
  );
}
