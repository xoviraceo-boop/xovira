'use client'

import { useEffect, useMemo, useRef, memo, useState } from 'react'
import { MessagePart } from '@llamaindex/chat-ui'
import { MessageRole } from '@xovira/database/src/generated/prisma/client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageDisplay } from './ChatDisplay'
import { TypingIndicator } from './TypingIndicator'
import { Button } from '@/components/ui/button'
import { ThumbsUp, ThumbsDown, Copy, Check, CornerDownRight } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { useToast } from '@/hooks/useToast'

export interface MessageFollowup {
  id: string
  label: string
  description?: string
}

export type MessageActionVariant = 'primary' | 'secondary' | 'ghost'

export interface MessageAction {
  id: string
  label: string
  variant?: MessageActionVariant
}

export interface RenderedMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string | Date
  parts?: MessagePart[]
  followups?: MessageFollowup[]
  actions?: MessageAction[]
  feedback?: {
    isHelpful: boolean | null
  } | null
}

interface ChatMessageListProps {
  messages: RenderedMessage[]
  pendingAssistantMessage?: string | React.ReactNode | null
  onFollowupClick?: (messageId: string, followup: MessageFollowup) => void
  onActionClick?: (messageId: string, action: MessageAction) => void
  onFeedbackChange?: (messageId: string, isHelpful: boolean | null) => void
}

const ROLE_LABELS: Record<MessageRole, string> = {
  USER: 'You',
  ASSISTANT: 'Xovira AI',
  SYSTEM: 'System',
  FUNCTION: 'Function',
}

const ROLE_AVATAR: Record<MessageRole, string> = {
  USER: '👤',
  ASSISTANT: '🤖',
  SYSTEM: '⚙️',
  FUNCTION: '🛠️',
}

// Memoize individual message component to prevent unnecessary rerenders
const MessageItem = memo(function MessageItem({
  message,
  isUser,
  isLast,
  onFollowupClick,
  onActionClick,
  onFeedbackChange,
}: {
  message: RenderedMessage
  isUser: boolean
  isLast: boolean
  onFollowupClick?: (messageId: string, followup: MessageFollowup) => void
  onActionClick?: (messageId: string, action: MessageAction) => void
  onFeedbackChange?: (messageId: string, isHelpful: boolean | null) => void
}) {
  const parts = message.parts ?? [{ type: 'text', text: message.content } satisfies MessagePart]
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const utils = trpc.useUtils()

  const feedbackMutation = trpc.chat.toggleMessageFeedback.useMutation({
    onSuccess: (data) => {
      onFeedbackChange?.(message.id, data.isHelpful)
      // Invalidate all message queries to update feedback state
      utils.chat.getMessages.invalidate()
    },
  })

  const showFollowups = !isUser && message.followups && message.followups.length > 0
  const showActions = !isUser && message.actions && message.actions.length > 0
  const showFeedbackButtons = !isUser && !message.id.startsWith('pending-') && !message.id.startsWith('temp-')
  
  const currentFeedback = message.feedback?.isHelpful ?? null
  const isLiked = currentFeedback === true
  const isDisliked = currentFeedback === false

  const handleLike = async () => {
    try {
      await feedbackMutation.mutateAsync({
        messageId: message.id,
        isHelpful: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update feedback',
        variant: 'destructive',
      })
    }
  }

  const handleDislike = async () => {
    try {
      await feedbackMutation.mutateAsync({
        messageId: message.id,
        isHelpful: false,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update feedback',
        variant: 'destructive',
      })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast({
        title: 'Copied!',
        description: 'Message copied to clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy message',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className={cn('flex w-full gap-2 sm:gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar className="h-8 w-8 shrink-0 border border-slate-200 sm:h-10 sm:w-10">
        <AvatarFallback className="text-xs sm:text-base">{ROLE_AVATAR[message.role]}</AvatarFallback>
      </Avatar>
      <Card
        className={cn(
          'max-w-[85%] rounded-2xl p-3 shadow-sm transition-all sm:max-w-[75%] sm:p-4',
          isUser
            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/20'
            : 'bg-white shadow-slate-200/80'
        )}
      >
        <div
          className={cn(
            'mb-1 text-[10px] font-semibold uppercase tracking-wide sm:mb-1.5 sm:text-xs',
            isUser ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}
        >
          {ROLE_LABELS[message.role]}
        </div>
        <MessageDisplay
          parts={parts}
          role={message.role.toLowerCase() as 'user' | 'assistant' | 'system' | 'function'}
          isLast={isLast}
          messageId={message.id}
        />

        {showFollowups && (
          <div className="mt-6 flex flex-col gap-2 w-full max-w-2xl">
            {/* Header Label */}
            <span className="text-[11px] font-medium text-muted-foreground/70 ml-1 mb-1">
              Follow ups
            </span>
            {/* Follow-up Buttons */}
            <div className="flex flex-col gap-2">
              {message.followups?.map((followup) => (
                <button
                  key={followup.id}
                  onClick={() => {
                    if (onFollowupClick) {
                      onFollowupClick(message.id, followup);
                    }
                  }}
                  className="group flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4 text-left shadow-sm transition-all hover:bg-slate-50 hover:border-black/10 active:scale-[0.99]"
                >
                  <CornerDownRight 
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50 group-hover:text-primary" 
                  />
                  <span className="text-[14px] leading-relaxed text-slate-700">
                    {followup.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          )}

        {showActions && (
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            {message.actions!.map((action) => {
              const variant = action.variant ?? 'primary'

              const buttonVariant =
                variant === 'secondary'
                  ? 'outline'
                  : variant === 'ghost'
                    ? 'ghost'
                    : 'default'

              return (
                <Button
                  key={action.id}
                  size="sm"
                  variant={buttonVariant as any}
                  onClick={() => onActionClick?.(message.id, action)}
                  className="rounded-full px-4"
                >
                  {action.label}
                </Button>
              )
            })}
          </div>
        )}

        {showFeedbackButtons && (
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handleLike}
              disabled={feedbackMutation.isPending}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-slate-100 disabled:opacity-50',
                isLiked
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  : 'text-slate-600'
              )}
            >
              <ThumbsUp className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
              <span>Like</span>
            </button>
            <button
              type="button"
              onClick={handleDislike}
              disabled={feedbackMutation.isPending}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-slate-100 disabled:opacity-50',
                isDisliked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'text-slate-600'
              )}
            >
              <ThumbsDown className={cn('h-3.5 w-3.5', isDisliked && 'fill-current')} />
              <span>Dislike</span>
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </Card>
    </div>
  )
})

// Memoize typing indicator component
const TypingIndicatorMessage = memo(function TypingIndicatorMessage() {
  return (
    <div className="flex w-full gap-2 sm:gap-3">
      <Avatar className="h-8 w-8 shrink-0 border border-slate-200 sm:h-10 sm:w-10">
        <AvatarFallback className="text-xs sm:text-base">{ROLE_AVATAR[MessageRole.ASSISTANT]}</AvatarFallback>
      </Avatar>
      <Card className="max-w-[85%] rounded-2xl bg-white p-3 shadow-sm shadow-slate-200/80 sm:max-w-[75%] sm:p-4">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:mb-1.5 sm:text-xs">
          {ROLE_LABELS[MessageRole.ASSISTANT]}
        </div>
        <TypingIndicator />
      </Card>
    </div>
  )
})

export const ChatMessageList = memo(function ChatMessageList({
  messages,
  pendingAssistantMessage,
  onFollowupClick,
  onActionClick,
  onFeedbackChange,
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const prevMessagesLengthRef = useRef(messages.length)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Memoize rendered messages to prevent recalculation
  const isPendingReactNode = pendingAssistantMessage !== null && pendingAssistantMessage !== undefined && typeof pendingAssistantMessage === 'object'

  const renderedMessages = useMemo(() => {
    // If pendingAssistantMessage is null, no pending message
    if (pendingAssistantMessage === null) {
      return messages
    }

    // If pendingAssistantMessage is a React node (e.g. ChatThinkingIndicator), don't add to messages; render separately
    if (isPendingReactNode) {
      return messages
    }

    // If pendingAssistantMessage is empty string, show typing indicator only
    if (pendingAssistantMessage === '') {
      return messages
    }

    // If pendingAssistantMessage has string content, show streaming message
    const content = String(pendingAssistantMessage)

    return [
      ...messages,
      {
        id: 'pending-assistant',
        role: MessageRole.ASSISTANT,
        content,
        createdAt: new Date().toISOString(),
        parts: [{ type: 'text', text: content } satisfies MessagePart],
      },
    ]
  }, [messages, pendingAssistantMessage, isPendingReactNode])

  const showTypingIndicator = !isPendingReactNode && pendingAssistantMessage === ''
  const showPendingReactNode = isPendingReactNode && !!pendingAssistantMessage

  // Auto-scroll only when new messages are added or streaming
  useEffect(() => {
    const hasNewMessage = messages.length > prevMessagesLengthRef.current
    const isStreaming = pendingAssistantMessage !== null

    if (hasNewMessage || isStreaming) {
      // Use a small delay to ensure DOM is updated
      const scrollToBottom = () => {
        // Try to find the ScrollArea viewport element
        if (scrollAreaRef.current) {
          const viewport = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement
          if (viewport) {
            viewport.scrollTo({
              top: viewport.scrollHeight,
              behavior: hasNewMessage ? 'smooth' : 'auto',
            })
            return
          }
        }
        
        // Fallback: use bottomRef to scroll into view
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({
            behavior: hasNewMessage ? 'smooth' : 'auto',
            block: 'end',
          })
        }
      }

      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        // Small delay to ensure DOM is fully updated
        setTimeout(scrollToBottom, 50)
      })
    }

    prevMessagesLengthRef.current = messages.length
  }, [messages.length, pendingAssistantMessage, renderedMessages.length])

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div ref={scrollRef} className="flex flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-6 md:px-8">
        {renderedMessages.map((message, index) => {
          const isUser = message.role === MessageRole.USER
          const isLast = index === renderedMessages.length - 1 && !showTypingIndicator && !showPendingReactNode

          return (
            <MessageItem
              key={message.id}
              message={message}
              isUser={isUser}
              isLast={isLast}
              onFollowupClick={onFollowupClick}
              onActionClick={onActionClick}
              onFeedbackChange={onFeedbackChange}
            />
          )
        })}

        {showTypingIndicator && <TypingIndicatorMessage />}
        {showPendingReactNode && <div className="py-2">{pendingAssistantMessage as React.ReactNode}</div>}

        {renderedMessages.length === 0 && !showTypingIndicator && !showPendingReactNode && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground sm:py-16">
            <div className="rounded-full bg-slate-100 p-4 sm:p-6">
              <span className="text-3xl sm:text-4xl">💬</span>
            </div>
            <p className="mt-2 font-medium text-slate-700">No messages yet</p>
            <p className="max-w-md text-xs text-slate-500 sm:text-sm">
              Start the conversation by asking the assistant about your project.
            </p>
          </div>
        )}

        {/* Invisible element at the bottom for scrolling reference */}
        <div ref={bottomRef} className="h-1" />
      </div>
    </ScrollArea>
  )
})
