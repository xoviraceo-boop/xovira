// app/projects/[id]/layout.tsx
"use client";

import { createContext, useContext, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import Layout from '@/features/dashboard/layouts/agent';

interface AgentContextValue {
  agentData: any;
  isLoading: boolean;
  isPublished: boolean;
  currentStatus: string;
  isPublishing: boolean;
  localDraft: any;
  refetch: () => void;
  handleTogglePublish: () => Promise<void>;
  isOwner: boolean;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgentContext must be used within AgentLayout');
  }
  return context;
};

interface AgentLayoutProps {
  children: React.ReactNode;
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  const params = useParams();
  const { data: session } = useSession();
  const agentId = params.id as string;

  const { data: agent, isLoading, refetch } = trpc.agent.get.useQuery(
    { id: agentId },
    { enabled: !!agentId }
  );

  const updateAgent = trpc.agent.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const isOwner = useMemo(() => {
    if (!agent || !session?.user) return false;
    return agent.createdBy === session.user.id;
  }, [agent, session]);

  const isPublished = agent?.status === 'ACTIVE';
  const currentStatus = agent?.status || 'DRAFT';

  const handleTogglePublish = async () => {
    if (!agent) return;
    
    const newStatus = agent.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    updateAgent.mutate({
      id: agent.id,
      status: newStatus,
      isActive: newStatus === 'ACTIVE',
    });
  };

  const contextValue: AgentContextValue = {
    agentData: agent,
    isLoading,
      isPublished,
      currentStatus,
    isPublishing: updateAgent.isPending,
    localDraft: null,
      refetch,
      handleTogglePublish,
      isOwner,
  };

  return (
    <AgentContext.Provider value={contextValue}>
      <Layout>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </Layout>
    </AgentContext.Provider>
  );
}