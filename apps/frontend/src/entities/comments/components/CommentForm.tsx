'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  FaAt, 
  FaHashtag, 
  FaImage, 
  FaSmile, 
  FaTimes 
} from 'react-icons/fa';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface CommentFormProps {
  postId: string;
  onSubmit: (content: string, attachments?: string[]) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  availableTags?: string[];
  availableUsers?: Array<{ id: string; name: string; email?: string }>;
}

export function CommentForm({
  postId,
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  autoFocus = false,
  availableTags = ['bug', 'feature', 'documentation', 'question', 'urgent', 'improvement'],
  availableUsers = [],
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursor = e.target.selectionStart;
    
    setContent(newContent);
    setCursorPosition(cursor);

    // Check for hashtag trigger
    const textBeforeCursor = newContent.slice(0, cursor);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      setTagSearch(hashtagMatch[1]);
      setShowTagSuggestions(true);
      setShowUserSuggestions(false);
    } else {
      setShowTagSuggestions(false);
    }

    // Check for mention trigger
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setUserSearch(mentionMatch[1]);
      setShowUserSuggestions(true);
      setShowTagSuggestions(false);
    } else {
      setShowUserSuggestions(false);
    }
  };

  const insertAtCursor = useCallback((text: string) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newContent = content.slice(0, start) + text + content.slice(end);
    
    setContent(newContent);
    
    // Set cursor position after inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = start + text.length;
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
        textareaRef.current.focus();
      }
    }, 0);
  }, [content]);

  const insertHashtag = useCallback(() => {
    insertAtCursor('#');
    setShowTagSuggestions(true);
  }, [insertAtCursor]);

  const insertMention = useCallback(() => {
    insertAtCursor('@');
    setShowUserSuggestions(true);
  }, [insertAtCursor]);

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    insertAtCursor(emojiData.emoji);
    setShowEmojiPicker(false);
  }, [insertAtCursor]);

  const selectTag = useCallback((tag: string) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#(\w*)$/);
    
    if (hashtagMatch) {
      const beforeHashtag = textBeforeCursor.slice(0, -hashtagMatch[0].length);
      const newContent = beforeHashtag + `#${tag} ` + textAfterCursor;
      setContent(newContent);
      
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = beforeHashtag.length + tag.length + 2;
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          textareaRef.current.focus();
        }
      }, 0);
    }
    
    setShowTagSuggestions(false);
    setTagSearch('');
  }, [content, cursorPosition]);

  const selectUser = useCallback((user: { id: string; name: string }) => {
    if (!textareaRef.current) return;

    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const beforeMention = textBeforeCursor.slice(0, -mentionMatch[0].length);
      const newContent = beforeMention + `@${user.name} ` + textAfterCursor;
      setContent(newContent);
      
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = beforeMention.length + user.name.length + 2;
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
          textareaRef.current.focus();
        }
      }, 0);
    }
    
    setShowUserSuggestions(false);
    setUserSearch('');
  }, [content, cursorPosition]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert files to data URLs (in production, upload to server)
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setAttachments((prev) => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmit(content.trim(), attachments);
    setContent('');
    setAttachments([]);
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const filteredUsers = availableUsers.filter((user) =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="min-h-[100px] resize-none pr-12"
          autoFocus={autoFocus}
          maxLength={2000}
        />

        {/* Hashtag Suggestions */}
        {showTagSuggestions && filteredTags.length > 0 && (
          <div className="absolute z-50 w-64 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 left-0">
            <ScrollArea className="max-h-48">
              <div className="p-1">
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => selectTag(tag)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm flex items-center gap-2 transition-colors"
                  >
                    <FaHashtag className="text-slate-400 text-xs" />
                    <span className="font-medium">{tag}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* User Mention Suggestions */}
        {showUserSuggestions && filteredUsers.length > 0 && (
          <div className="absolute z-50 w-64 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 left-0">
            <ScrollArea className="max-h-48">
              <div className="p-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectUser(user)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded text-sm transition-colors"
                  >
                    <div className="font-medium text-slate-800">{user.name}</div>
                    {user.email && (
                      <div className="text-xs text-slate-500">{user.email}</div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              <img
                src={attachment}
                alt={`Attachment ${index + 1}`}
                className="h-20 w-20 object-cover rounded-lg border border-slate-300 shadow-sm"
              />
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                title="Remove image"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertHashtag}
            title="Add hashtag"
            className="h-8 px-2.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <FaHashtag className="text-sm" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={insertMention}
            title="Mention user"
            className="h-8 px-2.5 hover:bg-purple-50 hover:text-purple-600 transition-colors"
          >
            <FaAt className="text-sm" />
          </Button>

          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Add emoji"
                className="h-8 px-2.5 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
              >
                <FaSmile className="text-sm" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0" align="start">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.LIGHT}
                searchPlaceHolder="Search emoji..."
                width={350}
                height={400}
                previewConfig={{
                  showPreview: false
                }}
              />
            </PopoverContent>
          </Popover>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            title="Upload image"
            className="h-8 px-2.5 hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <FaImage className="text-sm" />
          </Button>
        </div>

        {/* Character Count and Actions */}
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium transition-colors ${
            content.length > 1800 
              ? 'text-red-500' 
              : content.length > 1500 
              ? 'text-amber-500' 
              : 'text-slate-400'
          }`}>
            {content.length}/2000
          </span>

          <div className="flex gap-2">
            {onCancel && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={onCancel}
                className="hover:bg-slate-100"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              size="sm" 
              disabled={!content.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300"
            >
              Comment
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}