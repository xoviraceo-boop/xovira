'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, FolderPlusIcon } from 'lucide-react'
import { trpc } from '@/lib/trpc'
import { TaskContextType } from './TaskView'

interface TaskGroupCreationModalProps {
  context: TaskContextType
  contextId?: string
  workspaceId?: string
}

export function TaskGroupCreationModal({ context, contextId, workspaceId }: TaskGroupCreationModalProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')

  const utils = trpc.useUtils()

  const projectQuery = trpc.project.get.useQuery({ id: contextId || '' }, { enabled: context === 'PROJECT' && !!contextId && !workspaceId })
  const spaceQuery = trpc.space.get.useQuery({ id: contextId || '' }, { enabled: context === 'SPACE' && !!contextId && !workspaceId })
  const teamQuery = trpc.team.get.useQuery({ id: contextId || '' }, { enabled: context === 'TEAM' && !!contextId && !workspaceId })

  const resolvedWorkspaceId =
    workspaceId ||
    projectQuery.data?.workspaceId ||
    spaceQuery.data?.workspace?.id ||
    teamQuery.data?.workspaceId ||
    undefined

  const createList = trpc.list.create.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.list.byContext.invalidate({
        workspaceId: variables.workspaceId,
        projectId: variables.projectId ?? undefined,
        teamId: variables.teamId ?? undefined,
        spaceId: variables.spaceId ?? undefined,
        folderId: variables.folderId ?? undefined,
      })
    },
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: any = {
      name: name.trim(),
      description: description.trim() || undefined,
    }

    // Add context IDs - at least one must be provided
    if (resolvedWorkspaceId) payload.workspaceId = resolvedWorkspaceId
    if (context === 'PROJECT' && contextId) payload.projectId = contextId
    if (context === 'TEAM' && contextId) payload.teamId = contextId
    if (context === 'SPACE' && contextId) payload.spaceId = contextId

    // Ensure at least one context is provided
    if (!payload.workspaceId && !payload.projectId && !payload.teamId && !payload.spaceId) {
      return // Validation will be handled by tRPC
    }

    await createList.mutateAsync(payload)
    setIsOpen(false)
    setName('')
    setDescription('')
  }

  const isSubmitting = createList.isPending
  const isDisabled = !name.trim() || (!resolvedWorkspaceId && !contextId)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="max-w-24" variant="outline">
          <FolderPlusIcon className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create Task Group</DialogTitle>
          <DialogDescription>Group tasks for easier tracking</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="e.g., Sprint 12"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Optional details"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Group
            </Button>
          </div>
          {isDisabled && !name.trim() && (
            <p className="text-sm text-muted-foreground">
              Please provide a name for the group.
            </p>
          )}
          {isDisabled && name.trim() && !resolvedWorkspaceId && !contextId && (
            <p className="text-sm text-muted-foreground">
              Select a workspace, project, team, or space context before creating a group.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}