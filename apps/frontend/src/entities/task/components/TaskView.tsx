'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ListTaskView } from './ListTaskView'
import { ListGroupView } from './ListGroupView'

export type TaskContextType = 'SPACE' | 'PROJECT' | 'TEAM' | 'GENERAL'

type Option = { id: string; name: string }

interface TaskViewProps {
  context: TaskContextType
  contextId?: string
  workspaceId?: string
}

export function TaskView({ context, contextId, workspaceId }: TaskViewProps) {
  return (
    <div className="p-6">
      <Tabs defaultValue="tasks" className="w-full">
        <div className="border-b mb-4">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-2">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="tasks">
          <ListTaskView context={context} contextId={contextId} workspaceId={workspaceId} />
        </TabsContent>
        <TabsContent value="groups">
          <ListGroupView context={context} contextId={contextId} workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

