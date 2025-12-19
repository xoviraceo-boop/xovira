"use client";

import { useEffect, useMemo, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';

interface ToolContextValue {
  toolData: any;
  isLoading: boolean;
  refetch: () => Promise<any>;
  isOwner: boolean;
}

const ToolContext = createContext<ToolContextValue | null>(null);

export const useToolContext = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useToolContext must be used within ToolLayout');
  }
  return context;
};

interface ToolLayoutProps {
  children: React.ReactNode;
}

export default function ToolLayout({ children }: ToolLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const toolId = params?.id as string;
  const { data: session } = useSession();

  const toolInput = useMemo(
    () => (toolId ? { id: toolId } : { id: "" }),
    [toolId]
  );

  const { data: cloudData, isLoading: isCloudLoading, refetch } = trpc.tool.get.useQuery(
    toolInput,
    {
      enabled: !!toolId,
      refetchOnWindowFocus: true,
      refetchInterval: 5 * 60 * 1000,
    }
  );

  const isOwner = useMemo(() => {
    return !!(cloudData && (cloudData as any).ownerId && session?.user?.id && (cloudData as any).ownerId === session.user.id);
  }, [cloudData, session?.user?.id]);

  useEffect(() => {
    if (!toolId) router.push('/dashboard/tools');
  }, [toolId, router]);

  const contextValue: ToolContextValue = useMemo(
    () => ({
      toolData: cloudData,
      isLoading: isCloudLoading,
      refetch,
      isOwner,
    }),
    [cloudData, isCloudLoading, refetch, isOwner]
  );

  if (isCloudLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading tool...</p>
        </div>
      </div>
    );
  }

  if (!isCloudLoading && !cloudData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold">Permission denied</h2>
          <p className="text-muted-foreground">You don't have access to this tool. Ask the owner to add you as a member.</p>
        </div>
      </div>
    );
  }

  return (
    <ToolContext.Provider value={contextValue}>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </ToolContext.Provider>
  );
}
