"use client";

import { useEffect, useState, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/hooks/useReduxStore';
import { RootState } from '@/stores/store';
import { upsertTeam, setCurrentTeam } from '@/stores/slices/team.slice';
import { serializeDates } from '@/stores/utils/serialize';
import { trpc } from '@/lib/trpc';
import SyncWarningBanner from '@/components/ui/sync-warning-banner';
import TopBar from '@/components/navigation/TopBar';
import Layout from '@/features/dashboard/layouts/team';
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
  const nullableFields = ['teamId', 'expiresAt', 'timezone', 'teamId', 'currency', 'language', 'visibility'];
  nullableFields.forEach(field => {
    if (cleaned[field] === null) delete cleaned[field];
  });
  return cleaned;
};

interface TeamContextValue {
  teamData: any;
  isLoading: boolean;
  isPublished: boolean;
  currentStatus: string;
  isPublishing: boolean;
  localDraft: any;
  refetch: () => void;
  handleTogglePublish: () => Promise<void>;
  isOwner: boolean;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeamContext must be used within TeamLayout');
  }
  return context;
};

interface TeamLayoutProps {
  children: React.ReactNode;
}

export default function TeamLayout({ children }: TeamLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const teamId = params?.id as string;
  const { data: session } = useSession();
  
  const localDraft = useAppSelector(
    useCallback((s: RootState) => s.teams.items[teamId], [teamId])
  );
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSyncWarning, setShowSyncWarning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasCheckedInitialSync = useRef(false);

  const teamInput = useMemo(
    () => (teamId ? { id: teamId } : { id: "" }),
    [teamId]
  );

  const { data: cloudData, isLoading: isCloudLoading, refetch } = trpc.team.get.useQuery(
    teamInput,
    {
      enabled: !!teamId,
      refetchOnWindowFocus: true,
      refetchInterval: 5 * 60 * 1000,
    }
  );

  const publishMutation = trpc.team.publish.useMutation();
  const updateMutation = trpc.team.update.useMutation();
  const saveDraftMutation = trpc.team.saveDraft.useMutation();

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
    if (!teamId) router.push('/dashboard/teams');
  }, [teamId, router, cloudData, isCloudLoading]);

  // Set current team in Redux
  useEffect(() => {
    if (teamId) {
      dispatch(setCurrentTeam(teamId));
    }
  }, [dispatch, teamId]);

  // Load cloud data into Redux if not present locally
  useEffect(() => {
    if (cloudData && !localDraft && teamId) {
      dispatch(upsertTeam({ id: teamId, data: serializeDates(cloudData as any) }));
    }
  }, [cloudData, localDraft, teamId, dispatch]);

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
    if (!isCloudLoading && cloudData && localDraft && teamId) {
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
  }, [isCloudLoading, cloudData, localDraft, teamId]);

  const handleSyncAndSave = useCallback(async () => {
    if (!teamId || !localDraft) return;
    
    setIsSyncing(true);
    try {
      const cleanedData = cleanDataForMutation(localDraft);
      await saveDraftMutation.mutateAsync({
        id: teamId,
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
  }, [teamId, localDraft, saveDraftMutation, refetch]);

  const handleSkipSync = useCallback(() => {
    if (cloudData && teamId) {
      dispatch(upsertTeam({ id: teamId, data: serializeDates(cloudData as any) }));
    }
    setShowSyncWarning(false);
    hasCheckedInitialSync.current = true;
  }, [cloudData, teamId, dispatch]);

  const handleTogglePublish = useCallback(async () => {
    if (!teamId) return;
    
    setIsPublishing(true);
    try {
      if (isPublished) {
        await updateMutation.mutateAsync({
          id: teamId,
          // team.update doesn't accept status; rely on saveDraft instead
        });
      } else {
        await publishMutation.mutateAsync({
          id: teamId,
          ...cleanDataForMutation(localDraft)
        });
      }
      
      await refetch();
      
      dispatch(upsertTeam({
        id: teamId,
        data: { ...localDraft, status: isPublished ? 'DRAFT' : 'PUBLISHED' }
      }));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setIsPublishing(false);
    }
  }, [teamId, isPublished, localDraft, updateMutation, publishMutation, refetch, dispatch]);

  const contextValue: TeamContextValue = useMemo(
    () => ({
      teamData: cloudData || localDraft,
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
          <p className="text-muted-foreground">Loading team...</p>
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
          <p className="text-muted-foreground">You don't have access to this team. Ask the owner to add you as a member.</p>
        </div>
      </div>
    );
  }

  return (
    <TeamContext.Provider value={contextValue}>
      <Layout>
        <SyncWarningBanner
          isVisible={showSyncWarning}
          onSyncAndSave={handleSyncAndSave}
          onSkip={handleSkipSync}
          isLoading={isSyncing}
        />
        
        <TopBar
          onBeforeNavigate={checkSyncConflict}
          fallbackPath="/dashboard/teams"
          backButtonLabel="Back to Teams"
          rightContent={<StatusBadge status={currentStatus as any} />}
        />
        
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </Layout>
    </TeamContext.Provider>
  );
}