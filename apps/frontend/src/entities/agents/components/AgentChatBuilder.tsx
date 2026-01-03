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
import { AgentPreview } from './AgentBuilderPreview';
import { AgentProfile } from './AgentProfile';
import type { QuickAction, AgentDraft, UserContext, ConversationState } from '@/entities/agents/types';

interface AgentChatBuilderProps {
  agentId?: string;
  onAgentCreated?: (agentId: string) => void;
  onProgressUpdate?: (progress: {
    agentName?: string;
    avatar?: string;
    description?: string;
    agentType?: string;
    completedSteps?: string[];
    currentStep?: string;
  }) => void;
}

export const AgentChatBuilder: React.FC<AgentChatBuilderProps> = ({
  agentId,
  onAgentCreated,
  onProgressUpdate,
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

  // Load agent data if agentId provided
  const { data: agentData, isLoading: isLoadingAgent, refetch: refetchAgent } = trpc.agent.get.useQuery(
    { id: agentId! },
    { enabled: !!agentId }
  );

  // Mutations
  const initializeMutation = trpc.agent.builder.initialize.useMutation({
    onSuccess: async (data) => {
      setConversationId(data.conversationId);
      setConversationState(data.conversationState);
      setUserContext(data.userContext);
      setAgentDraft(data.conversationState.agentDraft);
      
      // Refetch agent data to get updated conversations list
      if (agentId) {
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

  const messageMutation = trpc.agent.builder.message.useMutation({
    onSuccess: async (data) => {
      setIsSending(false);
      setConversationState(data.conversationState);
      setAgentDraft(data.agentDraft);
      
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

      onProgressUpdate?.({
        agentName: data.agentDraft.name,
        avatar: data.agentDraft.avatar,
        description: data.agentDraft.description,
        agentType: data.agentDraft.agentType,
        currentStep: data.conversationState.stage,
      });
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

  const launchMutation = trpc.agent.builder.launch.useMutation({
    onSuccess: async (data) => {
      toast.success('Agent created successfully!');
      onAgentCreated?.(data.agentId);
      
      // Refetch agent data to get updated status (ACTIVE)
      if (agentId) {
        await refetchAgent();
      }
      
      // Show agent profile after launch
      setShowAgentProfile(true);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to launch agent');
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
    // Prevent multiple initializations
    if (conversationId || initializeMutation.isPending || hasInitialized.current) return;

    // If agentId is provided, wait for agent data to load before initializing
    if (agentId) {
      // Still loading agent data, wait
      if (isLoadingAgent) return;
      
      // Agent data loaded, check for existing conversation
      const storedConversationId = agentData?.conversations?.[0]?.id;
      
      hasInitialized.current = true;
      
      if (storedConversationId) {
        // Load existing conversation
        console.log('[AgentChatBuilder] Loading existing conversation:', storedConversationId);
        initializeMutation.mutate({ 
          conversationId: storedConversationId,
          agentId: agentId
        });
      } else {
        // No existing conversation, create a new one and link to agent
        console.log('[AgentChatBuilder] Creating new conversation for agent:', agentId);
        initializeMutation.mutate({ 
          agentId: agentId
        });
      }
    } else {
      // No agentId provided, create new conversation
      hasInitialized.current = true;
      initializeMutation.mutate({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, agentData, isLoadingAgent, conversationId]);

  // Mutation to mark follow-ups as consumed
  const markFollowupsConsumedMutation = trpc.chat.markFollowupsConsumed.useMutation();

  // ✅ Update handleSendMessage to wait for mutation before clearing
  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isSending || !conversationId) return;

    // ✅ IMMEDIATELY clear follow-ups from UI (optimistic update)
    setMessages(prev => prev.map(msg => ({ ...msg, followups: undefined })));
    setFollowupsMap(new Map()); // Clear all followups from state

    // Mark all existing assistant messages' follow-ups as consumed in the database (background operation)
    const assistantMessages = messages.filter(msg => msg.role === 'ASSISTANT');
    
    // ✅ Wait for all follow-up consumption mutations to complete
    const consumePromises = assistantMessages.map(msg => 
      markFollowupsConsumedMutation.mutateAsync({ messageId: msg.id }).catch(err => {
        console.error('Failed to mark follow-ups as consumed:', err);
      })
    );
    
    // Wait for all to complete before sending message
    await Promise.all(consumePromises);
    
    const optimisticId = `optimistic_${Date.now()}`;
    const userMessage: RenderedMessage = {
      id: optimisticId,
      role: 'USER' as MessageRole,
      content: message,
      createdAt: new Date(),
    };
    
    // Track this optimistic message
    optimisticMessageIds.current.add(optimisticId);
    
    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);
    messageMutation.mutate({ conversationId, message });
  }, [messageMutation, conversationId, isSending, messages, markFollowupsConsumedMutation]);

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
    if (action.id === 'launch-agent' && agentDraft?.status === 'ready' && conversationId) {
      launchMutation.mutate({ conversationId });
      return;
    }
    if (action.label) handleSendMessage(action.label);
  }, [handleSendMessage, launchMutation, conversationId, agentDraft]);

  // Resize functionality - must be before early return to follow Rules of Hooks
  const [profileWidth, setProfileWidth] = useState(480); // Initial width: 480px (w-96 = 384px, increased)
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const containerWidth = window.innerWidth;
      const minProfileWidth = 400; // Minimum width
      const maxProfileWidth = containerWidth * 0.7; // Maximum 70% of container
      
      const newWidth = containerWidth - e.clientX;
      const clampedWidth = Math.max(minProfileWidth, Math.min(maxProfileWidth, newWidth));
      setProfileWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

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
      {/* Chat Interface */}
      <div 
        className="flex flex-col px-6 overflow-hidden transition-all"
        style={{ width: `calc(100% - ${profileWidth}px)` }}
      >
        <Card className="flex h-full flex-col overflow-hidden border-0 bg-white shadow-none lg:rounded-2xl lg:border lg:shadow-2xl">
          <ChatHeader title="Create AI Agent" />
          
          <div className="relative flex-1 overflow-hidden">
            <ChatMessageList
              messages={messagesWithFollowups}
              pendingAssistantMessage={isSending ? 'Thinking...' : null}
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

      {/* Resize Handle */}
      <div
        ref={resizeRef}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        className="w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors flex-shrink-0"
        style={{ minWidth: '4px' }}
      />

      {/* Preview Panel */}
      <div 
        className="border-l bg-gradient-to-b from-background to-muted/20 flex-shrink-0 overflow-hidden"
        style={{ width: `${profileWidth}px`, minWidth: '400px' }}
      >
        {showAgentProfile && agentData ? (
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
            isReconfiguring={agentData.status === 'RECONFIGURING' || (agentData.status === 'ACTIVE' && conversationState?.stage && ['review', 'testing'].includes(conversationState.stage))}
            onEdit={() => toast.info('Edit agent configuration...')}
            onConfigure={() => setShowAgentProfile(false)}
          />
        ) : (
          <AgentPreview
            agentDraft={agentDraft}
            userContext={userContext}
            conversationState={conversationState}
            onPreviewChat={() => toast.info('Preview chat coming soon!')}
            onViewConfig={() => toast.info('Viewing agent configuration...')}
          />
        )}
      </div>
    </div>
  );
};