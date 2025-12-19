'use client'

import { Plus, MoreVertical, Edit2, Archive, Trash2, Share2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { memo } from 'react'

export interface ConversationListItem {
  id: string
  title: string | null
  lastMessageAt?: string | Date | null
  messageCount: number
}

interface ConversationListProps {
  conversations: ConversationListItem[]
  activeConversationId?: string | null
  onSelect: (conversationId: string) => void
  onCreate: () => Promise<void> | void
  isCreating?: boolean
  onRename?: (conversationId: string, title: string) => Promise<void>
  onDelete?: (conversationId: string) => Promise<void>
  onArchive?: (conversationId: string) => Promise<void>
  onShare?: (conversationId: string) => void
}

// Memoize individual conversation items
const ConversationItem = memo(function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onArchive,
  onShare,
}: {
  conversation: ConversationListItem
  isActive: boolean
  onSelect: (id: string) => void
  onRename?: (id: string, title: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onArchive?: (id: string) => Promise<void>
  onShare?: (id: string) => void
}) {
  const title = conversation.title?.trim() || 'Untitled chat'

  return (
    <div
      className={cn(
        'group relative flex w-full items-start gap-2 rounded-xl px-3 py-2.5 transition-all sm:gap-3 sm:px-4 sm:py-3',
        'hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        isActive ? 'bg-slate-800/70 shadow-lg shadow-black/20' : 'bg-transparent'
      )}
    >
      <div className={cn(
        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors sm:mt-1 sm:h-8 sm:w-8',
        isActive ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400'
      )}>
        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>

      <button
        onClick={() => onSelect(conversation.id)}
        className="flex min-w-0 flex-1 flex-col text-left"
      >
        <span className="truncate text-sm font-semibold text-white">{title}</span>
        <span className="mt-0.5 text-xs text-slate-400 sm:mt-1">
          {conversation.messageCount} {conversation.messageCount === 1 ? 'message' : 'messages'}
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'h-7 w-7 shrink-0 p-0 opacity-0 transition-all group-hover:opacity-100 sm:h-8 sm:w-8',
              'hover:bg-slate-700 text-slate-300 hover:text-white',
              isActive && 'opacity-100'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {onRename && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                const newTitle = prompt('Enter new title:', title)
                if (newTitle && newTitle.trim()) {
                  onRename(conversation.id, newTitle.trim())
                }
              }}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenuItem>
          )}
          {onShare && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onShare(conversation.id)
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
          )}
          {onArchive && (
            <>
              {(onRename || onShare) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive(conversation.id)
                }}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            </>
          )}
          {onDelete && (
            <>
              {(onRename || onShare || onArchive) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Are you sure you want to delete this conversation?')) {
                    onDelete(conversation.id)
                  }
                }}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})

export const ConversationList = memo(function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
  onCreate,
  isCreating,
  onRename,
  onDelete,
  onArchive,
  onShare,
}: ConversationListProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-0 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-50 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800/50 bg-slate-900/50 px-4 py-3 backdrop-blur-sm sm:px-5 sm:py-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 sm:text-sm">Conversations</h2>
        <Button 
          variant="primary" 
          onClick={() => onCreate()} 
          disabled={isCreating}
          className="h-8 gap-1.5 px-2.5 text-xs sm:h-9 sm:gap-2 sm:px-3 sm:text-sm"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">New chat</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {conversations.map((conversation) => {
            const isActive = activeConversationId === conversation.id

            return (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={isActive}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
                onArchive={onArchive}
                onShare={onShare}
              />
            )
          })}

          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center text-sm text-white/60 sm:py-12">
              <MessageSquare className="mb-2 h-10 w-10 text-white/30 sm:h-12 sm:w-12" />
              <p className="font-medium">No chats yet</p>
              <p className="text-xs text-white/50 sm:text-sm">
                Create a new chat to start collaborating with the AI assistant.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
})