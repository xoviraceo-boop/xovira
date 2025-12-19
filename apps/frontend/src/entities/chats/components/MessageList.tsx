'use client'

import { useEffect, useMemo, useRef, memo } from 'react'
import { MessagePart } from '@llamaindex/chat-ui'
import { MessageRole } from '@xovira/database/src/generated/prisma/client'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageDisplay } from './ChatDisplay'
import { TypingIndicator } from './TypingIndicator'

export interface RenderedMessage {
  id: string
  role: MessageRole
  content: string
  createdAt: string | Date
  parts?: MessagePart[]
}

interface ChatMessageListProps {
  messages: RenderedMessage[]
  pendingAssistantMessage?: string | null
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
}: {
  message: RenderedMessage
  isUser: boolean
  isLast: boolean
}) {
  const parts = message.parts ?? [{ type: 'text', text: message.content } satisfies MessagePart]

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
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  const prevMessagesLengthRef = useRef(messages.length)

  // Memoize rendered messages to prevent recalculation
  const renderedMessages = useMemo(() => {
    // If pendingAssistantMessage is null, no pending message
    if (pendingAssistantMessage === null) {
      return messages
    }

    // If pendingAssistantMessage is empty string, show typing indicator only
    if (pendingAssistantMessage === '') {
      return messages
    }

    // If pendingAssistantMessage has content, show streaming message
    const content = pendingAssistantMessage ?? ''

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
  }, [messages, pendingAssistantMessage])

  const showTypingIndicator = pendingAssistantMessage === ''

  // Auto-scroll only when new messages are added or streaming
  useEffect(() => {
    if (!scrollRef.current) return

    const hasNewMessage = messages.length > prevMessagesLengthRef.current
    const isStreaming = pendingAssistantMessage !== null

    if (hasNewMessage || isStreaming) {
      const element = scrollRef.current
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: hasNewMessage ? 'smooth' : 'auto',
        })
      })
    }

    prevMessagesLengthRef.current = messages.length
  }, [messages.length, pendingAssistantMessage])

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div ref={scrollRef} className="flex flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-6 md:px-8">
        {renderedMessages.map((message, index) => {
          const isUser = message.role === MessageRole.USER
          const isLast = index === renderedMessages.length - 1 && !showTypingIndicator

          return <MessageItem key={message.id} message={message} isUser={isUser} isLast={isLast} />
        })}

        {showTypingIndicator && <TypingIndicatorMessage />}

        {renderedMessages.length === 0 && !showTypingIndicator && (
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
      </div>
    </ScrollArea>
  )
})
