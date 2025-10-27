"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxStore';
import { RootState } from '@/stores/store';
import { upsertProject, setCurrentProject } from '@/stores/slices/project.slice';
import { serializeDates } from '@/stores/utils/serialize';
import { trpc } from '@/lib/trpc';
import Shell from '@/components/layout/Shell';
import SyncWarningBanner from '@/components/ui/sync-warning-banner';
import BackButton from '@/components/navigation/BackButton';
import { normalizeForComparison, deepEqual } from '@/utils/utilities/syncUtils';

const METADATA_FIELDS = ['id', 'createdAt', 'updatedAt', 'cloudSyncedAt', 'ownerId'] as const;

const checkForDataDifferences = function(local: any, cloud: any) {
  if (!local || !cloud) return false;
  var normalizedLocal = normalizeForComparison(METADATA_FIELDS, local);
  var normalizedCloud = normalizeForComparison(METADATA_FIELDS, cloud);
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

interface NewProjectLayoutProps {
  children: React.ReactNode;
}

export default function NewProjectLayout({ children }: NewProjectLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const projectId = params?.id as string;
  
  // Use selector with proper memoization
  const localDraft = useAppSelector(
    useCallback((s: RootState) => s.projects.items[projectId], [projectId])
  );
  
  const [showSyncWarning, setShowSyncWarning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Track if we've done initial sync check to prevent duplicate warnings
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

  const saveDraftMutation = trpc.project.saveDraft.useMutation();

  // Memoize current status
  const currentStatus = useMemo(
    () => cloudData?.status || localDraft?.status || 'DRAFT',
    [cloudData?.status, localDraft?.status]
  );

  // Redirect if no projectId
  useEffect(() => {
    if (!projectId) {
      router.push('/dashboard/projects/new');
    }
  }, [projectId, router]);

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

  // Memoize sync conflict checker
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
      hasCheckedInitialSync.current = true; // Reset check after successful sync
    } catch (error) {
      console.error('Failed to sync and save:', error);
      // Consider adding user-facing error notification here
    } finally {
      setIsSyncing(false);
    }
  }, [projectId, localDraft, saveDraftMutation, refetch]);

  const handleSkipSync = useCallback(() => {
    if (cloudData && projectId) {
      dispatch(upsertProject({ id: projectId, data: serializeDates(cloudData as any) }));
    }
    setShowSyncWarning(false);
    hasCheckedInitialSync.current = true; // Reset check after skipping
  }, [cloudData, projectId, dispatch]);

  return (
    <Shell>
      <SyncWarningBanner
        isVisible={showSyncWarning}
        onSyncAndSave={handleSyncAndSave}
        onSkip={handleSkipSync}
        isLoading={isSyncing}
      />
      
      <div className="flex justify-between">
        <BackButton 
          onBeforeNavigate={checkSyncConflict}
          fallbackPath="/dashboard/projects"
        >
          Back to Projects
        </BackButton>
        
        <div className="w-64 bg-muted/50 border-r p-4">
          <div className="text-sm text-muted-foreground">
            Status: <span className="font-medium">{currentStatus}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </Shell>
  );
}
