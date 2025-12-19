'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, UserIcon, FolderIcon, ListIcon } from 'lucide-react';
import { cn } from '@/lib/utils'; // utility function for merging classnames
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar'; // Ensure you have this component

// Utility type for common props
interface SelectOption { id: string; name: string }

type TaskContext = 'SPACE' | 'PROJECT' | 'TEAM' | 'GENERAL'
interface TaskDetailsFormProps {
  context: TaskContext;
  contextId?: string;
  users: SelectOption[];
  projects?: SelectOption[];
  teams?: SelectOption[];
  lists?: SelectOption[];
  spaces?: SelectOption[];
}

export function TaskDetailsForm({ context, contextId, users, projects = [], teams = [], lists = [], spaces = [] }: TaskDetailsFormProps) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  React.useEffect(() => {
    if (context === 'PROJECT' && contextId) setValue('projectId', contextId);
    if (context === 'TEAM' && contextId) setValue('teamId', contextId);
    if (context === 'SPACE' && contextId) setValue('spaceId', contextId);
  }, [context, contextId, setValue]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div className="md:col-span-2">
        <Label htmlFor="title" className="text-base font-semibold">
          Task Title
        </Label>
        <Input
          id="title"
          placeholder="e.g., Implement dark mode toggle"
          {...register('title')}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">
            {errors.title.message?.toString()}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="description" className="text-base font-semibold">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Detailed task description..."
          rows={5}
          {...register('description')}
        />
      </div>

      {context !== 'PROJECT' && (
        <div className="space-y-2">
          <Label htmlFor="projectId" className="flex items-center text-base font-semibold">
            <FolderIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            Project
          </Label>
          <Select onValueChange={(val) => setValue('projectId', val)} defaultValue={watch('projectId')}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="assigneeId" className="flex items-center text-base font-semibold">
          <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          Assignee
        </Label>
        <Select
          onValueChange={(val) => setValue('assigneeId', val)}
          defaultValue={watch('assigneeId')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="listId" className="flex items-center text-base font-semibold">
          <ListIcon className="h-4 w-4 mr-2 text-muted-foreground" />
          List
        </Label>
        <Select onValueChange={(val) => setValue('listId', val)} defaultValue={watch('listId')}>
          <SelectTrigger>
            <SelectValue placeholder="Select a list" />
          </SelectTrigger>
          <SelectContent>
            {lists.map((l) => (
              <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(context === 'SPACE' || context === 'GENERAL') && (
        <div className="space-y-2">
          <Label htmlFor="teamId" className="flex items-center text-base font-semibold">
            <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            Team
          </Label>
          <Select onValueChange={(val) => setValue('teamId', val)} defaultValue={watch('teamId')}>
            <SelectTrigger>
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {context === 'GENERAL' && (
        <div className="space-y-2">
          <Label htmlFor="spaceId" className="flex items-center text-base font-semibold">
            <FolderIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            Space
          </Label>
          <Select onValueChange={(val) => setValue('spaceId', val)} defaultValue={watch('spaceId')}>
            <SelectTrigger>
              <SelectValue placeholder="Select a space" />
            </SelectTrigger>
            <SelectContent>
              {spaces.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
