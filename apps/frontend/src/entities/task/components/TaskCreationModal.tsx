'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormProvider, useForm } from 'react-hook-form';
import { TaskDetailsForm } from './TaskDetailsForm';
import { TaskOptionsForm } from './TaskOptionsForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PlusIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { taskFormSchema, TaskFormValues } from '@/entities/task/validations/task.schema';
import { trpc } from '@/lib/trpc';
import type { AppRouter } from '@/trpc/root';
import type { inferRouterInputs } from '@trpc/server';

type TaskContext = 'SPACE' | 'PROJECT' | 'TEAM' | 'GENERAL'
type Option = { id: string; name: string }

interface CreateTaskModalProps {
  context: TaskContext;
  contextId?: string;
  workspaceId?: string;
  users: Option[];
  projects?: Option[];
  teams?: Option[];
  lists?: Option[];
  spaces?: Option[];
}

type RouterInputs = inferRouterInputs<AppRouter>;
type TaskCreateInput = RouterInputs['task']['create'];

export function CreateTaskModal({ context, contextId, workspaceId, users, projects = [], teams = [], lists = [], spaces = [] }: CreateTaskModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const createTask = trpc.task.create.useMutation();
  const utils = trpc.useUtils();
  const methods = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema as any),
    defaultValues: {
      title: '',
      description: '',
      visibility: 'PRIVATE',
      isPublic: false,
      workspaceId: workspaceId,
      spaceId: context === 'SPACE' ? contextId : undefined,
      projectId: context === 'PROJECT' ? contextId : undefined,
      teamId: context === 'TEAM' ? contextId : undefined,
      listId: undefined,
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: TaskCreateInput = {
        title: data.title,
        description: data.description || undefined,
        visibility: data.visibility,
        isPublic: data.isPublic ?? false,
        workspaceId: data.workspaceId || workspaceId,
        spaceId: context === 'SPACE' ? contextId : data.spaceId || undefined,
        projectId: context === 'PROJECT' ? contextId : data.projectId || undefined,
        teamId: context === 'TEAM' ? contextId : data.teamId || undefined,
        assigneeId: data.assigneeId || undefined,
        listId: data.listId || undefined,
      };
      await createTask.mutateAsync(payload);
      await utils.task.list.invalidate();
    } finally {
      setIsSubmitting(false);
      setIsOpen(false);
      methods.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="font-semibold">
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-2xl font-bold">Create New Task</DialogTitle>
          <DialogDescription>
            Fill out the details below to create a new task.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Tabs defaultValue="details" className="w-full">
              <div className="border-b px-6">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                  <TabsTrigger value="options">Options</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="h-[calc(70vh-140px)] max-h-[500px] overflow-y-auto">
                <div className="p-6 space-y-6">
                  <TabsContent value="details">
                    <TaskDetailsForm
                      context={context}
                      contextId={contextId}
                      users={users}
                      projects={projects}
                      teams={teams}
                      lists={lists}
                      spaces={spaces}
                    />
                  </TabsContent>
                  <TabsContent value="attachments">
                    <div className="text-center py-10 border rounded-lg border-dashed">
                      <p className="text-muted-foreground">
                        Drag and drop files here, or click to upload.
                      </p>
                      <Button variant="outline" className="mt-4">
                        Select Files
                      </Button>
                    </div>
                    
                  </TabsContent>
                  <TabsContent value="options">
                    <TaskOptionsForm />
                  </TabsContent>
                </div>
              </ScrollArea>

              {/* Footer and Submit Button */}
              <div className="flex justify-end p-4 border-t sticky bottom-0 bg-white dark:bg-gray-950">
                <Button variant="ghost" type="button" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="ml-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Task
                </Button>
              </div>
            </Tabs>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
