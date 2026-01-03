'use client'

import { useCallback, useMemo, useState } from 'react'

import { trpc } from '@/lib/trpc'
import type { RenderedMessage } from '../components/MessageList'
import type { ChatContextType } from '../utils/context'
import { MessageRole } from '@xovira/database/src/generated/prisma/client'

interface UseChatsParams {
  contextType?: ChatContextType
  entityId?: string
  activeConversationId?: string | null
}

export function useChats({ contextType, entityId, activeConversationId }: UseChatsParams) {
  const utils = trpc.useUtils()

  const conversationsQuery = trpc.chat.list.useQuery(
    { 
      contextType: contextType ?? 'project',
      entityId: entityId ?? '',
    },
    {
      enabled: Boolean(contextType && entityId),
    }
  )

  const messagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: activeConversationId ?? '' },
    {
      enabled: Boolean(activeConversationId),
      // Prevent showing loading state when refetching
      notifyOnChangeProps: ['data', 'error'],
      // Reduce refetch frequency
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      // Use stale time to prevent unnecessary refetches
      staleTime: 1000,
      // Light polling to keep chat feeling realtime for multi-user scenarios
      refetchInterval: 3000,
    }
  )

  const createMutation = trpc.chat.create.useMutation()
  const renameMutation = trpc.chat.rename.useMutation()
  const { data: model } = trpc.chat.getModel.useQuery()
  const { data: config } = trpc.chat.getModelConfig.useQuery()
  const [isSending, setIsSending] = useState(false)
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (conversationId: string, message: string, options?: { attachments?: any[]; webSearch?: boolean }) => {
      if (!entityId || !contextType) {
        throw new Error('Entity ID and context type are required to send a message')
      }

      setIsSending(true)
      // Set to empty string to show typing indicator
      setPendingAssistantMessage('')

      // Optimistically add user message to show it immediately
      const optimisticUserMessage: RenderedMessage = {
        id: `temp-user-${Date.now()}`,
        role: 'USER' as MessageRole,
        content: message,
        createdAt: new Date(),
      }

      // Optimistically update the cache to show user message immediately
      utils.chat.getMessages.setData({ conversationId }, (oldData) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          messages: [...oldData.messages, optimisticUserMessage],
        }
      })

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationId,
            contextType,
            entityId,
            message,
            attachments: options?.attachments,
            webSearch: options?.webSearch,
            config: {
              RPM: config?.maxRPM ?? 0,
              RPD: config?.maxRPD ?? 0,
            },
          }),
        })

        if (!response.ok || !response.body) {
          const errorText = await response.text()
          throw new Error(errorText || 'Failed to send chat message')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let assistantMessage = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          assistantMessage += decoder.decode(value, { stream: true })
          // Update streaming message in real-time
          setPendingAssistantMessage(assistantMessage)
        }

        assistantMessage += decoder.decode()
        
        // Optimistically add the final assistant message to cache
        const optimisticAssistantMessage: RenderedMessage = {
          id: `temp-assistant-${Date.now()}`,
          role: 'ASSISTANT' as MessageRole,
          content: assistantMessage,
          createdAt: new Date(),
        }

        utils.chat.getMessages.setData({ conversationId }, (oldData) => {
          if (!oldData) return oldData
          // Remove the temp user message and add both real messages
          const messagesWithoutTemp = oldData.messages.filter(
            (msg) => !msg.id.startsWith('temp-')
          )
          return {
            ...oldData,
            messages: [
              ...messagesWithoutTemp,
              optimisticUserMessage,
              optimisticAssistantMessage,
            ],
          }
        })

        // Clear pending message
        setPendingAssistantMessage(null)

        // Use a delay to avoid immediate refetch
        setTimeout(() => {
          Promise.all([
            utils.chat.getMessages.invalidate({ conversationId }),
            utils.chat.list.invalidate({ contextType, entityId }),
          ]).catch((error) => {
            // Silently handle errors in background sync
            console.error('Background sync error:', error)
          })
        }, 1000)
      } catch (error) {
        setPendingAssistantMessage(null)
        // On error, refetch to ensure consistency
        await utils.chat.getMessages.invalidate({ conversationId })
        throw error
      } finally {
        setIsSending(false)
      }
    },
    [entityId, contextType, config, utils]
  )

  const createConversation = useCallback(
    async (options?: { title?: string; systemPrompt?: string }) => {
      if (!entityId || !contextType) {
        throw new Error('Entity ID and context type are required to create a chat')
      }

      const conversation = await createMutation.mutateAsync({
        contextType,
        entityId,
        modelId: model?.id ?? '',
        title: options?.title,
        systemPrompt: options?.systemPrompt,
      })
      
      await utils.chat.list.invalidate({ contextType, entityId })
      return conversation
    },
    [createMutation, entityId, contextType, model, utils]
  )

  const renameConversation = useCallback(
    async (conversationId: string, title: string) => {
      await renameMutation.mutateAsync({ conversationId, title })
      if (entityId && contextType) {
        await utils.chat.list.invalidate({ contextType, entityId })
      }
    },
    [entityId, contextType, renameMutation, utils]
  )

  // Memoize messages with stable reference
  const renderedMessages = useMemo<RenderedMessage[]>(() => {
    if (!messagesQuery.data?.messages) return []

    return messagesQuery.data.messages.map((message: any) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
      feedback: message.feedback || null,
    }))
  }, [messagesQuery.data?.messages])

  return {
    conversations: conversationsQuery.data ?? [],
    isLoadingConversations: conversationsQuery.isLoading,
    messages: renderedMessages,
    // Only show loading on initial fetch, not on refetch
    isLoadingMessages: messagesQuery.isLoading && !messagesQuery.data,
    createConversation,
    isCreatingConversation: createMutation.isPending,
    renameConversation,
    sendMessage,
    isSending,
    pendingAssistantMessage,
  }
}

