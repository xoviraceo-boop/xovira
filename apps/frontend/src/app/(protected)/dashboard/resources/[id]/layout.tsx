"use client";

import { useEffect, useMemo, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';

interface ResourceContextValue {
  resourceData: any;
  isLoading: boolean;
  refetch: () => Promise<any>;
  isOwner: boolean;
}

const ResourceContext = createContext<ResourceContextValue | null>(null);

export const useResourceContext = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResourceContext must be used within ResourceLayout');
  }
  return context;
};

interface ResourceLayoutProps {
  children: React.ReactNode;
}

export default function ResourceLayout({ children }: ResourceLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const resourceId = params?.id as string;
  const { data: session } = useSession();

  const resourceInput = useMemo(
    () => (resourceId ? { id: resourceId } : { id: "" }),
    [resourceId]
  );

  const { data: cloudData, isLoading: isCloudLoading, refetch } = trpc.resource.get.useQuery(
    resourceInput,
    {
      enabled: !!resourceId,
      refetchOnWindowFocus: true,
      refetchInterval: 5 * 60 * 1000,
    }
  );

  const isOwner = useMemo(() => {
    return !!(cloudData && (cloudData as any).ownerId && session?.user?.id && (cloudData as any).ownerId === session.user.id);
  }, [cloudData, session?.user?.id]);

  useEffect(() => {
    if (!resourceId) router.push('/dashboard/resources');
  }, [resourceId, router]);

  const contextValue: ResourceContextValue = useMemo(
    () => ({
      resourceData: cloudData,
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
          <p className="text-muted-foreground">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (!isCloudLoading && !cloudData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold">Permission denied</h2>
          <p className="text-muted-foreground">You don't have access to this resource. Ask the owner to add you as a member.</p>
        </div>
      </div>
    );
  }

  return (
    <ResourceContext.Provider value={contextValue}>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </ResourceContext.Provider>
  );
}
