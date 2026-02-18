"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import {
  ChatMessageList,
  RenderedMessage,
  MessageFollowup,
  MessageAction,
} from '@/entities/chats/components/MessageList';
import { ChatComposer } from '@/entities/chats/components/ChatComposer';
import { ChatHeader } from '@/entities/chats/components/ChatHeader';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { MessageRole } from '@xovira/database/src/generated/prisma/client';
import { AgentProfile } from '@/entities/agents/components/AgentProfile';
import { ThinkingIndicator } from '@/entities/agents/components/ThinkingIndicator';
import type { QuickAction, AgentDraft, UserContext, ConversationState } from '@/entities/agents/types';
import { ResizableSplitLayout } from '@/components/layout/ResizableSplitLayout';

interface OperatorViewProps {
  agentId?: string;
  agent?: any;
}

export const OperatorView: React.FC<OperatorViewProps> = ({
  agentId,
  agent,
}) => {
  const [messages, setMessages] = useState<RenderedMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState | null>(null);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [followupsMap, setFollowupsMap] = useState<Map<string, MessageFollowup[]>>(new Map());
  const [agentDraft, setAgentDraft] = useState<AgentDraft | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showAgentProfile, setShowAgentProfile] = useState(false);
  const resolvedAgentId = agentId ?? agent?.id;

  // Track optimistic message IDs to remove them when confirmed
  const optimisticMessageIds = useRef<Set<string>>(new Set());

  // Fetch messages from database
  const { data: messagesData, refetch: refetchMessages, isLoading: isLoadingMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    {
      enabled: !!conversationId,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 0,
    }
  );

  const { data: agentData, isLoading: isLoadingAgent, refetch: refetchAgent } = trpc.agent.get.useQuery(
    { id: resolvedAgentId!, conversationType: 'AGENT_OPERATOR' },
    {
      enabled: !!resolvedAgentId,
      initialData: agent,
    }
  );

  const initializeMutation = trpc.agent.operator.initialize.useMutation({
    onSuccess: async (data) => {
      setConversationId(data.conversationId);
      setConversationState(data.conversationState);
      setUserContext(data.userContext);
      setAgentDraft(data.conversationState.agentDraft);

      if (resolvedAgentId) {
        await refetchAgent();
      }

      // Refetch messages to get latest from DB
      const result = await refetchMessages();

      // Load follow-ups from message metadata (persisted) and from API response
      if (result.data?.messages) {
        const followupsMapFromDB = new Map<string, MessageFollowup[]>();

        // First, load follow-ups from persisted metadata
        result.data.messages.forEach(msg => {
          const followupsFromMetadata = (msg as any).followups;
          if (followupsFromMetadata && Array.isArray(followupsFromMetadata)) {
            followupsMapFromDB.set(msg.id, followupsFromMetadata);
          }
        });

        // Then, add follow-ups from API response if provided (for new welcome messages)
        if (data.followups?.length) {
          const assistantMessages = result.data.messages.filter(m => m.role === 'ASSISTANT');
          const latestAssistant = assistantMessages[assistantMessages.length - 1];
          if (latestAssistant) {
            followupsMapFromDB.set(latestAssistant.id, data.followups);
          }
        }

        setFollowupsMap(followupsMapFromDB);
      }

      setIsInitializing(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to initialize conversation');
      setIsInitializing(false);
    },
  });

  const launchMutation = trpc.agent.operator.launch.useMutation({
    onSuccess: async (data) => {
      toast.success('Agent launched successfully!');
      if (resolvedAgentId) {
        await refetchAgent();
      }
      setShowAgentProfile(true);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to launch agent');
    },
  });

  const messageMutation = trpc.agent.operator.message.useMutation({
    onSuccess: async (data) => {
      setIsSending(false);
      setConversationState(data.conversationState);
      setAgentDraft(data.agentDraft);

      // Refetch agent data to get updated configuration from operator updates
      if (resolvedAgentId) {
        await refetchAgent();
      }

      // Refetch messages to get the confirmed messages from DB
      const result = await refetchMessages();

      // Clear optimistic messages since we now have confirmed DB messages
      if (result.data?.messages) {
        optimisticMessageIds.current.clear();

        const allMessages = result.data.messages;

        const dbMessages: RenderedMessage[] = allMessages.map((msg, index) => {
          // Get follow-ups from message data (persisted in metadata)
          const followupsFromMetadata = (msg as any).followups;

          // Only show follow-ups if:
          // 1. The message has follow-ups in metadata
          // 2. The follow-ups haven't been consumed (check metadata.followupsConsumed)
          // 3. This is the LAST assistant message (no user messages after it)
          let followups: MessageFollowup[] | undefined = undefined;

          if (msg.role === 'ASSISTANT') {
            // Check if follow-ups are consumed in metadata (persisted state)
            const metadata = (msg as any).metadata || {};
            const followupsConsumed = metadata.followupsConsumed === true;

            // Check if there are any user messages after this assistant message
            const hasUserMessageAfter = allMessages.slice(index + 1).some(m => m.role === 'USER');

            // ✅ CRITICAL: Only show follow-ups if not consumed AND no user message after AND has follow-ups in metadata
            if (!followupsConsumed && !hasUserMessageAfter && followupsFromMetadata && Array.isArray(followupsFromMetadata)) {
              followups = followupsFromMetadata;
            }
          }

          return {
            id: msg.id,
            role: msg.role as MessageRole,
            content: msg.content,
            createdAt: msg.createdAt,
            followups,
          };
        });

        setMessages(dbMessages);

        // ✅ Update followupsMap based on what's actually shown
        const newFollowupsMap = new Map<string, MessageFollowup[]>();
        dbMessages.forEach(msg => {
          if (msg.followups) {
            newFollowupsMap.set(msg.id, msg.followups);
          }
        });
        setFollowupsMap(newFollowupsMap);
      }

      // ✅ ONLY attach NEW followups from the API response (for the latest assistant message)
      if (data.followups?.length && result.data?.messages) {
        const assistantMessages = result.data.messages.filter(m => m.role === 'ASSISTANT');
        const latestAssistant = assistantMessages[assistantMessages.length - 1];

        if (latestAssistant) {
          // Check if this message already has follow-ups marked as consumed
          const metadata = (latestAssistant as any).metadata || {};
          const followupsConsumed = metadata.followupsConsumed === true;

          // Only add follow-ups if they haven't been consumed
          if (!followupsConsumed) {
            setFollowupsMap(prev => {
              const newMap = new Map(prev);
              newMap.set(latestAssistant.id, data.followups!);
              return newMap;
            });

            // Update messages to include followups immediately
            setMessages(prev => prev.map(msg =>
              msg.id === latestAssistant.id
                ? { ...msg, followups: data.followups }
                : msg
            ));
          }
        }
      }

      // Switch to profile view if agent is ready or active
      const isReady = data.agentDraft.status === 'ready';
      const isActive = agentData?.status === 'ACTIVE' && agentData?.isActive;
      if ((isReady || isActive) && !showAgentProfile) {
        setTimeout(() => setShowAgentProfile(true), 500);
      }
    },
    onError: (error) => {
      setIsSending(false);

      // Clear the optimistic message on error
      setMessages(prev => prev.filter(msg => !optimisticMessageIds.current.has(msg.id)));
      optimisticMessageIds.current.clear();

      toast.error(error.message || 'Failed to process message');

      // Add error message
      setMessages(prev => [...prev, {
        id: `error_${Date.now()}`,
        role: 'ASSISTANT' as MessageRole,
        content: `Error: ${error.message}. Please try again.`,
        createdAt: new Date(),
      }]);
    },
  });

  // Sync messages from database (only when not sending to avoid conflicts)
  useEffect(() => {
    if (messagesData?.messages && conversationId && !isSending) {
      const allMessages = messagesData.messages;

      const dbMessages: RenderedMessage[] = allMessages.map((msg, index) => {
        // Get follow-ups from message data (persisted in metadata)
        const followupsFromMetadata = (msg as any).followups;

        // Only show follow-ups if:
        // 1. The message has follow-ups in metadata
        // 2. The follow-ups haven't been consumed (check metadata.followupsConsumed)
        // 3. This is the LAST assistant message (no user messages after it)
        let followups: MessageFollowup[] | undefined = undefined;

        if (msg.role === 'ASSISTANT') {
          // Check if follow-ups are consumed in metadata (persisted state)
          const metadata = (msg as any).metadata || {};
          const followupsConsumed = metadata.followupsConsumed === true;

          // Check if there are any user messages after this assistant message
          const hasUserMessageAfter = allMessages.slice(index + 1).some(m => m.role === 'USER');

          // ✅ CRITICAL: Only show follow-ups if not consumed AND no user message after AND has follow-ups in metadata
          if (!followupsConsumed && !hasUserMessageAfter && followupsFromMetadata && Array.isArray(followupsFromMetadata)) {
            followups = followupsFromMetadata;
          }
        }

        return {
          id: msg.id,
          role: msg.role as MessageRole,
          content: msg.content,
          createdAt: msg.createdAt,
          followups,
        };
      });

      if (dbMessages.length > 0) {
        setMessages(dbMessages);
        // Clear optimistic messages since we have DB messages
        optimisticMessageIds.current.clear();

        // ✅ Update followupsMap to only include follow-ups that are actually shown
        const newFollowupsMap = new Map<string, MessageFollowup[]>();
        dbMessages.forEach(msg => {
          if (msg.followups) {
            newFollowupsMap.set(msg.id, msg.followups);
          }
        });
        setFollowupsMap(newFollowupsMap);
      }
    }
  }, [messagesData, conversationId, isSending]);

  // Show AgentProfile when agent is ACTIVE
  useEffect(() => {
    if (agentData && agentData.status === 'ACTIVE' && agentData.isActive && !showAgentProfile) {
      setShowAgentProfile(true);
    }
  }, [agentData, showAgentProfile]);

  // Initialize conversation - use ref to prevent multiple calls
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (conversationId || initializeMutation.isPending || hasInitialized.current) return;

    if (resolvedAgentId) {
      if (isLoadingAgent) return;

      const storedConversationId = agentData?.conversations?.[0]?.id;

      hasInitialized.current = true;

      if (storedConversationId) {
        console.log('[AgentChatBuilder] Loading existing conversation:', storedConversationId);
        initializeMutation.mutate({
          conversationId: storedConversationId,
          agentId: resolvedAgentId,
        });
      } else {
        console.log('[AgentChatBuilder] Creating new conversation for agent:', resolvedAgentId);
        initializeMutation.mutate({
          agentId: resolvedAgentId,
        });
      }
    } else {
      // For new agents without an ID, we need to create one first
      // Skip initialization if no agentId is available
      console.log('[AgentChatBuilder] No agent ID available, skipping initialization');
      setIsInitializing(false);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedAgentId, agentData, isLoadingAgent, conversationId]);

  // Mutation to mark follow-ups as consumed
  const markFollowupsConsumedMutation = trpc.chat.markFollowupsConsumed.useMutation();

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isSending || !conversationId || !resolvedAgentId) return;

    setMessages(prev => prev.map(msg => ({ ...msg, followups: undefined })));
    setFollowupsMap(new Map());

    const assistantMessages = messages.filter(msg => msg.role === 'ASSISTANT');

    const consumePromises = assistantMessages.map(msg =>
      markFollowupsConsumedMutation.mutateAsync({ messageId: msg.id }).catch(err => {
        console.error('Failed to mark follow-ups as consumed:', err);
      })
    );

    await Promise.all(consumePromises);

    const optimisticId = `optimistic_${Date.now()}`;
    const userMessage: RenderedMessage = {
      id: optimisticId,
      role: 'USER' as MessageRole,
      content: message,
      createdAt: new Date(),
    };

    optimisticMessageIds.current.add(optimisticId);

    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);
    messageMutation.mutate({ conversationId, agentId: resolvedAgentId, message });
  }, [messageMutation, conversationId, resolvedAgentId, isSending, messages, markFollowupsConsumedMutation]);

  // ✅ Update handleFollowupClick to wait for mutation
  const handleFollowupClick = useCallback(async (messageId: string, followup: MessageFollowup) => {
    // ✅ IMMEDIATELY remove follow-ups from UI (optimistic update)
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, followups: undefined } : msg
    ));

    // Remove from state map
    setFollowupsMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(messageId);
      return newMap;
    });

    // ✅ Wait for mutation to complete before sending message
    try {
      await markFollowupsConsumedMutation.mutateAsync({ messageId });
    } catch (error) {
      console.error('Failed to mark follow-ups as consumed:', error);
    }

    // Send the follow-up message
    handleSendMessage(followup.label);
  }, [handleSendMessage, markFollowupsConsumedMutation]);

  const handleActionClick = useCallback((messageId: string, action: MessageAction) => {
    if (action.id === 'launch-agent' && agentDraft?.status === 'ready' && conversationId && resolvedAgentId) {
      launchMutation.mutate({ conversationId, agentId: resolvedAgentId });
      return;
    }
    if (action.label) handleSendMessage(action.label);
  }, [handleSendMessage, launchMutation, conversationId, agentDraft]);

  // Resize functionality replaced by ResizableSplitLayout
  const [profileWidth, setProfileWidth] = useState(480);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Initializing agent builder...</p>
        </div>
      </div>
    );
  }

  // Merge messages with followups (messages already have follow-ups set correctly from useEffect)
  // Prefer follow-ups from the message object (which respects consumed state) over the map
  const messagesWithFollowups = messages.map(msg => ({
    ...msg,
    followups: msg.followups || followupsMap.get(msg.id),
  }));

  return (
    <div className="flex h-full">
      <ResizableSplitLayout
        MainContent={
          <div className="flex flex-col h-full bg-slate-50">
            <Card className="flex h-full flex-col overflow-hidden border-0 bg-white shadow-none lg:rounded-2xl lg:border lg:shadow-2xl">
              <ChatHeader title="Create AI Agent" />

              <div className="relative flex-1 overflow-hidden">
                <ChatMessageList
                  messages={messagesWithFollowups}
                  pendingAssistantMessage={
                    isSending ? <ThinkingIndicator stage={conversationState?.stage || 'configuration'} /> : null
                  }
                  onFollowupClick={handleFollowupClick}
                  onActionClick={handleActionClick}
                />
              </div>

              <div className="border-t p-4">
                <ChatComposer
                  onSend={handleSendMessage}
                  isSending={isSending}
                  disabled={isSending || !conversationId}
                />
              </div>
            </Card>
          </div>
        }
        SidePanelContent={
          <div className="h-full border-l bg-gradient-to-b from-background to-muted/20 overflow-hidden">
            <AgentProfile
              agent={{
                id: agentData.id,
                name: agentData.name || agentDraft?.name || 'Unnamed Agent',
                description: agentData.description ?? agentDraft?.description ?? null,
                avatar: agentData.avatar ?? agentDraft?.avatar ?? null,
                status: (agentData.status === 'ACTIVE' ? 'ACTIVE' : agentData.status === 'DRAFT' ? 'DRAFT' : agentData.status === 'BUILDING' ? 'BUILDING' : agentData.status === 'RECONFIGURING' ? 'RECONFIGURING' : agentData.status === 'EXECUTING' ? 'EXECUTING' : 'INACTIVE') as "ACTIVE" | "DRAFT" | "INACTIVE" | "BUILDING" | "RECONFIGURING" | "EXECUTING",
                isActive: agentData.isActive ?? false,
                agentType: agentData.agentType ?? agentDraft?.agentType ?? null,
                systemPrompt: agentData.systemPrompt ?? agentDraft?.systemPrompt ?? null,
                capabilities: agentData.capabilities ?? agentDraft?.capabilities ?? null,
                constraints: agentData.constraints ?? agentDraft?.constraints ?? null,
                createdAt: agentData.createdAt ?? new Date(),
                updatedAt: agentData.updatedAt ?? new Date(),
                metadata: (agentData.metadata as any) ?? {},
                triggers: (agentData.triggers || []).map(t => ({
                  id: t.id,
                  triggerType: t.triggerType,
                  triggerConfig: t.triggerConfig as any,
                  name: t.name,
                  description: t.description,
                  isActive: t.isActive,
                  priority: t.priority,
                  tags: t.tags,
                })),
                tools: (agentData.tools || []).map(t => ({
                  id: t.id,
                  name: t.name,
                  description: t.description,
                  category: t.category,
                  toolType: t.toolType,
                  isActive: t.isActive,
                })),
                schedules: (agentData.schedules || []).map(s => ({
                  id: s.id,
                  name: s.name,
                  description: s.description,
                  repeatTime: s.repeatTime,
                  startTime: s.startTime,
                  endTime: s.endTime,
                  timezone: s.timezone,
                  instructions: s.instructions,
                  isActive: s.isActive,
                  priority: s.priority,
                })),
              }}
              conversationType="AGENT_OPERATOR"
              isReconfiguring={agentData.status === 'RECONFIGURING' || (agentData.status === 'ACTIVE' && conversationState?.stage && ['review', 'testing'].includes(conversationState.stage))}
              onEdit={() => toast.info('Edit agent configuration...')}
              onConfigure={() => setShowAgentProfile(false)}
            />
          </div>
        }
        isPanelOpen={true}
      />
    </div>
  );
};
