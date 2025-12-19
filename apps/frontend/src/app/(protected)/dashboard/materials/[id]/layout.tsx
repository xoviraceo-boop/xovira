"use client";

import { useEffect, useMemo, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';

interface MaterialContextValue {
  materialData: any;
  isLoading: boolean;
  isPublished: boolean;
  currentStatus: string;
  isPublishing: boolean;
  refetch: () => Promise<any>;
  isOwner: boolean;
}

const MaterialContext = createContext<MaterialContextValue | null>(null);

export const useMaterialContext = () => {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error('useMaterialContext must be used within materialLayout');
  }
  return context;
};

interface materialLayoutProps {
  children: React.ReactNode;
}

export default function MaterialLayout({ children }: materialLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const materialId = params?.id as string;
  const { data: session } = useSession();

  const materialInput = useMemo(
    () => (materialId ? { id: materialId } : { id: "" }),
    [materialId]
  );

  const { data: cloudData, isLoading: isCloudLoading, refetch } = trpc.material.get.useQuery(
    materialInput,
    {
      enabled: !!materialId,
      refetchOnWindowFocus: true,
      refetchInterval: 5 * 60 * 1000,
    }
  );

  const currentStatus = useMemo(
    () => cloudData?.status ?? 'DRAFT',
    [cloudData?.status]
  );
  const isPublished = currentStatus === 'PUBLISHED';

  const isOwner = useMemo(() => {
    return !!(cloudData && (cloudData as any).ownerId && session?.user?.id && (cloudData as any).ownerId === session.user.id);
  }, [cloudData, session?.user?.id]);

  // Redirect only if no id; if data doesn't exist, show permission denied state instead
  useEffect(() => {
    if (!materialId) router.push('/dashboard/materials');
  }, [materialId, router]);

  const contextValue: MaterialContextValue = useMemo(
    () => ({
      materialData: cloudData,
      isLoading: isCloudLoading,
      isPublished,
      currentStatus,
      isPublishing: false,
      refetch,
      isOwner,
    }),
    [cloudData, isCloudLoading, isPublished, currentStatus, refetch, isOwner]
  );

  if (isCloudLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading material...</p>
        </div>
      </div>
    );
  }

  // Permission gate: show empty state if user is not allowed to view
  if (!isCloudLoading && !cloudData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold">Permission denied</h2>
          <p className="text-muted-foreground">You don't have access to this material. Ask the owner to add you as a member.</p>
        </div>
      </div>
    );
  }

  return (
    <MaterialContext.Provider value={contextValue}>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
    </MaterialContext.Provider>
  );
}
