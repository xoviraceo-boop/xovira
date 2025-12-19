'use client'

import * as React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreateTaskModal } from './TaskCreationModal'
import { TaskContextType } from './TaskView'
import { trpc } from '@/lib/trpc'

type Option = { id: string; name: string }

interface ListTaskViewProps {
  context: TaskContextType
  contextId?: string
  workspaceId?: string
}

export function ListTaskView({ context, contextId, workspaceId }: ListTaskViewProps) {
  const [users, setUsers] = React.useState<Option[]>([])
  const [projects, setProjects] = React.useState<Option[]>([])
  const [teams, setTeams] = React.useState<Option[]>([])
  const [lists, setLists] = React.useState<Option[]>([])
  const [spaces, setSpaces] = React.useState<Option[]>([])
  const [effectiveWorkspaceId, setEffectiveWorkspaceId] = React.useState<string | undefined>(workspaceId)

  const taskQueryInput = React.useMemo(() => {
    if (context === 'PROJECT') return { projectId: contextId, includeRelations: true }
    if (context === 'TEAM') return { teamId: contextId, includeRelations: true }
    if (context === 'SPACE') return { spaceId: contextId, includeRelations: true }
    if (context === 'GENERAL') return { workspaceId: effectiveWorkspaceId, includeRelations: true }
    return { includeRelations: true }
  }, [context, contextId, effectiveWorkspaceId])

  const { data: tasksData, isLoading } = trpc.task.list.useQuery(taskQueryInput)

  const spaceData = trpc.space.get.useQuery({ id: context === 'SPACE' ? contextId || '' : '' }, { enabled: context === 'SPACE' && !!contextId })
  const projectParticipants = trpc.project.getParticipants.useQuery({ projectId: contextId || '' }, { enabled: context === 'PROJECT' && !!contextId })
  const teamParticipants = trpc.team.getParticipants.useQuery({ teamId: contextId || '' }, { enabled: context === 'TEAM' && !!contextId })
  const projectData = trpc.project.get.useQuery({ id: contextId || '' }, { enabled: context === 'PROJECT' && !!contextId })
  const teamData = trpc.team.get.useQuery({ id: contextId || '' }, { enabled: context === 'TEAM' && !!contextId })
  const workspaceData = trpc.workspace.get.useQuery(
    { id: effectiveWorkspaceId || '' },
    { enabled: context === 'GENERAL' && !!effectiveWorkspaceId }
  )

  const listQueryInput = React.useMemo(() => {
    if (!effectiveWorkspaceId) return undefined
    if (context === 'PROJECT') return { workspaceId: effectiveWorkspaceId, projectId: contextId }
    if (context === 'TEAM') return { workspaceId: effectiveWorkspaceId, teamId: contextId }
    if (context === 'SPACE') return { workspaceId: effectiveWorkspaceId, spaceId: contextId }
    return { workspaceId: effectiveWorkspaceId }
  }, [context, contextId, effectiveWorkspaceId])

  const { data: listQueryData } = trpc.list.byContext.useQuery(listQueryInput!, {
    enabled: !!listQueryInput,
  })

  React.useEffect(() => {
    if (spaceData.data && context === 'SPACE') {
      setUsers((spaceData.data.members || []).map((m: any) => ({ id: m.user.id, name: m.user.name || m.user.email })))
      setProjects((spaceData.data.projects || []).map((p: any) => ({ id: p.id, name: p.name })))
      setTeams((spaceData.data.teams || []).map((t: any) => ({ id: t.id, name: t.name })))
      setEffectiveWorkspaceId(spaceData.data.workspace?.id || spaceData.data.workspaceId || effectiveWorkspaceId)
    }
  }, [spaceData.data, context, effectiveWorkspaceId])

  React.useEffect(() => {
    if (projectParticipants.data && context === 'PROJECT') {
      setUsers((projectParticipants.data.users || []).map((u: any) => ({ id: u.id, name: u.name || u.email })))
      setTeams((projectParticipants.data.teams || []).map((t: any) => ({ id: t.id, name: t.name })))
    }
  }, [projectParticipants.data, context])

  React.useEffect(() => {
    if (projectData.data && context === 'PROJECT') {
      setEffectiveWorkspaceId(projectData.data.workspaceId || effectiveWorkspaceId)
    }
  }, [projectData.data, context, effectiveWorkspaceId])

  React.useEffect(() => {
    if (teamParticipants.data && context === 'TEAM') {
      setUsers((teamParticipants.data.users || []).map((u: any) => ({ id: u.id, name: u.name || u.email })))
    }
  }, [teamParticipants.data, context])

  React.useEffect(() => {
    if (teamData.data && context === 'TEAM') {
      setEffectiveWorkspaceId(teamData.data.workspaceId || effectiveWorkspaceId)
    }
  }, [teamData.data, context, effectiveWorkspaceId])

  React.useEffect(() => {
    if (workspaceData.data && context === 'GENERAL') {
      setEffectiveWorkspaceId(workspaceData.data.id || effectiveWorkspaceId)
      setSpaces((workspaceData.data.spaces || []).map((s: any) => ({ id: s.id, name: s.name })))
      setProjects((workspaceData.data.projects || []).map((p: any) => ({ id: p.id, name: p.name })))
      setTeams((workspaceData.data.teams || []).map((t: any) => ({ id: t.id, name: t.name })))
      setUsers((workspaceData.data.members || []).map((m: any) => ({ id: m.user.id, name: m.user.name || m.user.email })))
    }
  }, [workspaceData.data, context, effectiveWorkspaceId])

  React.useEffect(() => {
    if (listQueryData?.items) {
      setLists(listQueryData.items.map((l: any) => ({ id: l.id, name: l.name })))
    }
  }, [listQueryData?.items])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <CreateTaskModal
          context={context}
          contextId={contextId}
          workspaceId={effectiveWorkspaceId}
          users={users}
          projects={projects}
          teams={teams}
          lists={lists}
          spaces={spaces}
        />
      </div>
      <div className="bg-white rounded-lg shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>List</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7}>Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading && tasksData?.items?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>No tasks found</TableCell>
              </TableRow>
            )}
            {tasksData?.items?.map((t: any) => (
              <TableRow key={t.id}>
                <TableCell>{t.title}</TableCell>
                <TableCell>{t.assignee?.name || ''}</TableCell>
                <TableCell>{t.project?.name || ''}</TableCell>
                <TableCell>{t.team?.name || ''}</TableCell>
                <TableCell>{t.list?.name || ''}</TableCell>
                <TableCell>{t.visibility}</TableCell>
                <TableCell>{new Date(t.updatedAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

