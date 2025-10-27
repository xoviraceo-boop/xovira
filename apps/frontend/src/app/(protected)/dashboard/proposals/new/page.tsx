"use client";
import Shell from "@/components/layout/Shell";
import { PROPOSAL_TYPES } from "@/entities/proposals/constants";
import ProposalTypeCard from "@/entities/proposals/components/ProposalTypeCard";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/useToast"; // Add this import
import React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useReduxStore";
import { upsertProposal } from "@/stores/slices/proposal.slice";
import { serializeDates } from "@/stores/utils/serialize";

export default function NewProposalPage() {
  const router = useRouter(); 
  const dispatch = useAppDispatch();
  const createMutation = trpc.proposal.create.useMutation();
  const { toast } = useToast();

  const handleSelect = async (type: string) => {
    try {
      const { id, data } = await createMutation.mutateAsync({
        title: "Untitled Proposal",
        shortSummary: "",
        detailedDesc: "",
        category: type.toUpperCase(),
        status: "DRAFT",
      } as any);
      dispatch(upsertProposal({ id, data: serializeDates(data as any) }));
      router.push(`/dashboard/proposals/new/${id}`);
    } catch (e) {
      console.error("Failed to create proposal:", e);
      toast({
        title: "Failed to create proposal",
        description: "An error occurred while creating your proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Shell>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Proposal Type</h1>
          <p className="text-muted-foreground">Select a type to start a draft. You can edit details later.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {PROPOSAL_TYPES.map((t) => (
            <ProposalTypeCard 
              key={t.type} 
              type={t.type} 
              title={t.title} 
              description={t.description} 
              color={t.color} 
              icon={t.icon} 
              onSelect={handleSelect}
              disabled={createMutation.isPending}
            />
          ))}
        </div>
      </div>
    </Shell>
  );
}