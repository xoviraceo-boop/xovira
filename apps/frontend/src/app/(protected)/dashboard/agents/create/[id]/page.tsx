"use client";

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { AgentChatBuilder } from '@/entities/agents/components/AgentChatBuilder';
import Shell from "@/components/layout/Shell";

export default function AgentCreationPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  // Fetch agent
  const { data: agent, isLoading, error } = trpc.agent.get.useQuery(
    { id: agentId, conversationType: 'AGENT_BUILDER' },
    { enabled: !!agentId }
  );

  // If agent doesn't exist, redirect
  useEffect(() => {
    if (!isLoading && !agent && error) {
      toast.error('Agent not found');
      router.push('/dashboard/agents');
    }
  }, [agentId, isLoading, agent, error, router]);

  const handleAgentCreated = (createdAgentId: string) => {
    toast.success('Agent created successfully!');
    router.push(`/dashboard/agents/${createdAgentId}`);
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading agent...</p>
          </div>
        </div>
      </Shell>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <Shell>
      <div className="h-[calc(100vh-8rem)]">
        <AgentChatBuilder
          agentId={agentId}
          onAgentCreated={handleAgentCreated}
        />
      </div>
    </Shell>
  );
}

