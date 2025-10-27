// app/projects/[id]/layout.tsx
"use client";

import { useEffect, useState, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxStore';
import { RootState } from '@/stores/store';
import { upsertProject, setCurrentProject } from '@/stores/slices/project.slice';
import { serializeDates } from '@/stores/utils/serialize';
import { trpc } from '@/lib/trpc';
import Shell from '@/components/layout/Shell';
import SyncWarningBanner from '@/components/ui/sync-warning-banner';
import TopBar from '@/components/navigation/TopBar';
import Layout from '@/features/dashboard/layouts/project';
import StatusBadge from '@/components/ui/status-badge';
import { normalizeForComparison, deepEqual } from '@/utils/utilities/syncUtils';

const METADATA_FIELDS = ['id', 'createdAt', 'updatedAt', 'cloudSyncedAt', 'ownerId'] as const;

const checkForDataDifferences = (local: any, cloud: any) => {
  if (!local || !cloud) return false;
  const normalizedLocal = normalizeForComparison(METADATA_FIELDS, local);
  const normalizedCloud = normalizeForComparison(METADATA_FIELDS, cloud);
  return !deepEqual(normalizedLocal, normalizedCloud);
};

const cleanDataForMutation = (data: any) => {
  const cleaned = { ...data };
  const nullableFields = ['projectId', 'expiresAt', 'timezone', 'teamId', 'currency', 'language', 'visibility'];
  nullableFields.forEach(field => {
    if (cleaned[field] === null) delete cleaned[field];
  });
  return cleaned;
};

interface ProjectContextValue {
  projectData: any;
  isLoading: boolean;
  isPublished: boolean;
  currentStatus: string;
  isPublishing: boolean;
  localDraft: any;
  refetch: () => void;
  handleTogglePublish: () => Promise<void>;
  isOwner: boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectLayout');
  }
  return context;
};

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const projectId = params?.id as string;
  const { data: session } = useSession();
  
  const localDraft = useAppSelector(
    useCallback((s: RootState) => s.projects.items[projectId], [projectId])
  );
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSyncWarning, setShowSyncWarning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasCheckedInitialSync = useRef(false);

  const projectInput = useMemo(
    () => (projectId ? { id: projectId } : { id: "" }),
    [projectId]
  );

  const { data: cloudData, isLoading: isCloudLoading, refetch } = trpc.project.get.useQuery(
    projectInput,
    {
      enabled: !!projectId,
      refetchOnWindowFocus: true,
      refetchInterval: 5 * 60 * 1000,
    }
  );

  const publishMutation = trpc.project.publish.useMutation();
  const updateMutation = trpc.project.update.useMutation();
  const saveDraftMutation = trpc.project.saveDraft.useMutation();

  const currentStatus = useMemo(
    () => cloudData?.status || localDraft?.status || 'DRAFT',
    [cloudData?.status, localDraft?.status]
  );
  const isPublished = currentStatus === 'PUBLISHED';

  const isOwner = useMemo(() => {
    return !!(cloudData && (cloudData as any).ownerId && session?.user?.id && (cloudData as any).ownerId === session.user.id);
  }, [cloudData, session?.user?.id]);

  // Redirect only if no id; if data doesn't exist, show permission denied state instead
  useEffect(() => {
    if (!projectId) router.push('/dashboard/projects');
  }, [projectId, router, cloudData, isCloudLoading]);

  // Set current project in Redux
  useEffect(() => {
    if (projectId) {
      dispatch(setCurrentProject(projectId));
    }
  }, [dispatch, projectId]);

  // Load cloud data into Redux if not present locally
  useEffect(() => {
    if (cloudData && !localDraft && projectId) {
      dispatch(upsertProject({ id: projectId, data: serializeDates(cloudData as any) }));
    }
  }, [cloudData, localDraft, projectId, dispatch]);

  // Check for sync conflicts only once on initial load
  useEffect(() => {
    if (cloudData && localDraft && !hasCheckedInitialSync.current) {
      const hasConflict = checkForDataDifferences(localDraft, cloudData);
      if (hasConflict) {
        setShowSyncWarning(true);
      }
      hasCheckedInitialSync.current = true;
    }
  }, [cloudData, localDraft]);

  const checkSyncConflict = useCallback(async (): Promise<boolean> => {
    if (!isCloudLoading && cloudData && localDraft && projectId) {
      const hasLocalChanges = checkForDataDifferences(localDraft, cloudData);
      
      if (hasLocalChanges) {
        console.log('Sync conflict detected');
        setShowSyncWarning(true);
        return true;
      }
      
      setShowSyncWarning(false);
      return false;
    }
    return false;
  }, [isCloudLoading, cloudData, localDraft, projectId]);

  const handleSyncAndSave = useCallback(async () => {
    if (!projectId || !localDraft) return;
    
    setIsSyncing(true);
    try {
      const cleanedData = cleanDataForMutation(localDraft);
      await saveDraftMutation.mutateAsync({
        id: projectId,
        ...cleanedData,
      });
      await refetch();
      setShowSyncWarning(false);
      hasCheckedInitialSync.current = true;
    } catch (error) {
      console.error('Failed to sync and save:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [projectId, localDraft, saveDraftMutation, refetch]);

  const handleSkipSync = useCallback(() => {
    if (cloudData && projectId) {
      dispatch(upsertProject({ id: projectId, data: serializeDates(cloudData as any) }));
    }
    setShowSyncWarning(false);
    hasCheckedInitialSync.current = true;
  }, [cloudData, projectId, dispatch]);

  const handleTogglePublish = useCallback(async () => {
    if (!projectId) return;
    
    setIsPublishing(true);
    try {
      if (isPublished) {
        await updateMutation.mutateAsync({
          id: projectId,
          // project.update doesn't accept status; rely on saveDraft instead
        });
      } else {
        await publishMutation.mutateAsync({
          id: projectId,
          ...cleanDataForMutation(localDraft)
        });
      }
      
      await refetch();
      
      dispatch(upsertProject({
        id: projectId,
        data: { ...localDraft, status: isPublished ? 'DRAFT' : 'PUBLISHED' }
      }));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setIsPublishing(false);
    }
  }, [projectId, isPublished, localDraft, updateMutation, publishMutation, refetch, dispatch]);

  const contextValue: ProjectContextValue = useMemo(
    () => ({
      projectData: cloudData || localDraft,
      isLoading: isCloudLoading,
      isPublished,
      currentStatus,
      isPublishing,
      localDraft,
      refetch,
      handleTogglePublish,
      isOwner,
    }),
    [cloudData, localDraft, isCloudLoading, isPublished, currentStatus, isPublishing, refetch, handleTogglePublish, isOwner]
  );

  if (isCloudLoading && !localDraft) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading project...</p>
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
          <p className="text-muted-foreground">You don't have access to this project. Ask the owner to add you as a member.</p>
        </div>
      </div>
    );
  }

  return (
    <ProjectContext.Provider value={contextValue}>
      <Layout>
        <SyncWarningBanner
          isVisible={showSyncWarning}
          onSyncAndSave={handleSyncAndSave}
          onSkip={handleSkipSync}
          isLoading={isSyncing}
        />
        
        <TopBar
          onBeforeNavigate={checkSyncConflict}
          fallbackPath="/dashboard/projects"
          backButtonLabel="Back to Projects"
          rightContent={<StatusBadge status={currentStatus as any} />}
        />
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </Layout>
    </ProjectContext.Provider>
  );
}