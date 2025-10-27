"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import ProposalForm from '@/entities/proposals/components/ProposalForm';

export default function NewProposalPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params?.id as string;

  const { data: proposal } = trpc.proposal.get.useQuery({ id: proposalId }, { enabled: !!proposalId });

  // If already published, do not allow access to new route
  useEffect(() => {
    if (proposal && proposal.status !== 'DRAFT') {
      router.replace(`/dashboard/proposals/${proposalId}`);
    }
  }, [proposal, proposalId, router]);

  return <ProposalForm proposalId={proposalId} mode="create" />;
}