'use client';

import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Controller } from 'react-hook-form';
import { Lock, Globe, EyeOff } from 'lucide-react';

export function TaskOptionsForm() {
  const { control, watch, setValue } = useFormContext();
  const isPublic = watch('isPublic');

  return (
    <div className="grid gap-8">
      {/* Visibility Setting */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center">
          <Lock className="h-5 w-5 mr-2 text-primary" />
          Task Visibility
        </h3>
        <p className="text-sm text-muted-foreground">
          Control who can view and interact with this task within the workspace.
        </p>
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Label
                htmlFor="visibility-private"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary transition-all"
              >
                <div className="flex items-center w-full">
                    <EyeOff className="h-5 w-5 mr-3 text-red-500" />
                    <span className="font-semibold">Private (Creator Only)</span>
                    <RadioGroupItem value="PRIVATE" id="visibility-private" className="ml-auto" />
                </div>
                <p className="text-sm text-muted-foreground mt-2 w-full text-left">
                  Only the creator and assigned members can see this task.
                </p>
              </Label>
              <Label
                htmlFor="visibility-workspace"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary transition-all"
              >
                <div className="flex items-center w-full">
                    <Globe className="h-5 w-5 mr-3 text-green-500" />
                    <span className="font-semibold">Workspace</span>
                    <RadioGroupItem value="WORKSPACE" id="visibility-workspace" className="ml-auto" />
                </div>
                <p className="text-sm text-muted-foreground mt-2 w-full text-left">
                  Visible to all members of the associated workspace/project.
                </p>
              </Label>
            </RadioGroup>
          )}
        />
      </div>

      {/* Public Status Setting */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-bold flex items-center">
          <Globe className="h-5 w-5 mr-2 text-primary" />
          Public Sharing
        </h3>
        <p className="text-sm text-muted-foreground">
          Toggle this to generate a public link, making the task visible to anyone outside the platform (read-only).
        </p>

        <div className="flex items-center justify-between rounded-md border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="isPublic" className="text-base">
              Share Publicly
            </Label>
            <p className="text-sm text-muted-foreground">
              {isPublic ? 'Public link is active.' : 'Public link is disabled.'}
            </p>
          </div>
          <Controller
            control={control}
            name="isPublic"
            render={({ field }) => (
                <Switch
                    id="isPublic"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                />
            )}
          />
        </div>

        {isPublic && (
            <div className="text-sm p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r">
                <p className="font-medium text-green-700 dark:text-green-300">
                    A public share URL will be generated after creation.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}