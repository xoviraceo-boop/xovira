'use client'

import { useState, useRef, useEffect, memo } from 'react'
import { SendHorizontal, Loader2, Paperclip, Search, X, Zap, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ParsedFile } from '../utils/fileParser'
import { cn } from '@/lib/utils'

interface ChatComposerProps {
  onSend: (message: string, options?: { attachments?: ParsedFile[]; webSearch?: boolean; contexts?: Array<{ type: string; id: string }> }) => Promise<void> | void
  conversationId?: string
  isSending?: boolean
  disabled?: boolean
  onContextClick?: () => void
  contextCount?: number
}

export const ChatComposer = memo(function ChatComposer({ 
  onSend, 
  conversationId, 
  isSending, 
  disabled,
  onContextClick,
  contextCount = 0
}: ChatComposerProps) {
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<ParsedFile[]>([])
  const [webSearch, setWebSearch] = useState(false)
  const [contexts, setContexts] = useState<Array<{ type: string; id: string }>>([])
  const [uploading, setUploading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
    }
  }, [value])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        if (conversationId) {
          formData.append('conversationId', conversationId)
        }

        const response = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to upload file')
        }

        return response.json() as Promise<ParsedFile>
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      setAttachments((prev) => [...prev, ...uploadedFiles])
    } catch (error) {
      console.error('File upload error:', error)
      alert('Failed to upload file(s)')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!value.trim() || isSending || disabled) return
    const message = value.trim()
    setValue('')
    const currentAttachments = [...attachments]
    const currentWebSearch = webSearch
    const currentContexts = contexts.length > 0 ? contexts : undefined
    setAttachments([])
    setWebSearch(false)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
    
    await onSend(message, { attachments: currentAttachments, webSearch: currentWebSearch, contexts: currentContexts })
  }

  // Update contexts when contextCount changes (from parent)
  useEffect(() => {
    // This allows parent to control contexts
  }, [contextCount])

  return (
    <div
      className={cn(
        'w-full rounded-xl border-2 bg-white transition-all duration-200 sm:rounded-2xl',
        isFocused 
          ? 'border-primary/50 shadow-lg shadow-primary/10' 
          : 'border-slate-200 shadow-md'
      )}
    >
      <div className="p-3 sm:p-4">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 sm:mb-3">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 transition-all hover:border-primary/50 hover:bg-primary/5 sm:px-3 sm:py-2"
              >
                <Paperclip className="h-3 w-3 shrink-0 text-slate-500 sm:h-3.5 sm:w-3.5" />
                <span className="max-w-[120px] truncate text-xs font-medium text-slate-700 sm:max-w-[200px] sm:text-sm">
                  {attachment.filename}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600"
                  disabled={disabled || isSending}
                >
                  <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask anything about your project..."
          className="max-h-[200px] min-h-[60px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-slate-400 focus-visible:ring-0 sm:min-h-[80px] sm:text-base"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              handleSubmit()
            }
          }}
          disabled={disabled || isSending}
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || isSending || uploading}
          />
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSending || uploading}
            className="h-8 w-8 rounded-lg p-0 transition-all hover:bg-slate-200 sm:h-9 sm:w-9"
            title="Attach files"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary sm:h-4 sm:w-4" />
            ) : (
              <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </Button>
          
          {onContextClick && (
            <Button
              type="button"
              variant="ghost"
              onClick={onContextClick}
              disabled={disabled || isSending}
              className={cn(
                'h-8 w-8 rounded-lg p-0 transition-all sm:h-9 sm:w-9 relative',
                contextCount > 0
                  ? 'bg-primary text-white hover:bg-primary/90' 
                  : 'hover:bg-slate-200'
              )}
              title="Select context"
            >
              <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {contextCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary">
                  {contextCount}
                </span>
              )}
            </Button>
          )}
          
          <Button
            type="button"
            variant="ghost"
            onClick={() => setWebSearch(!webSearch)}
            disabled={disabled || isSending}
            className={cn(
              'h-8 w-8 rounded-lg p-0 transition-all sm:h-9 sm:w-9',
              webSearch 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'hover:bg-slate-200'
            )}
            title="Enable web search"
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>

          <span className="ml-2 hidden text-xs text-slate-500 lg:inline">
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold">Shift</kbd>
            {' + '}
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold">Enter</kbd>
          </span>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={disabled || isSending || !value.trim()}
          className="h-9 w-full gap-2 rounded-lg px-4 font-semibold shadow-sm transition-all hover:shadow-md disabled:opacity-50 sm:w-auto"
        >
          {isSending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
              <span className="text-sm sm:text-base">Sending...</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-sm sm:text-base">Send</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
})