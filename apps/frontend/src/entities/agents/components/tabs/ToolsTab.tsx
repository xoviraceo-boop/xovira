"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ToolsSelectionModal } from './ToolsSelectionModal';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface ToolsTabProps {
  agentId: string;
  tools: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    toolType: string;
    isActive: boolean;
  }>;
  isReconfiguring: boolean;
  onUpdate?: () => void;
}

export function ToolsTab({ 
  agentId, 
  tools = [],
  isReconfiguring,
  onUpdate 
}: ToolsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch system tools to get tool details
  const { data: systemTools, isLoading: loadingTools } = trpc.agent.getSystemTools.useQuery(
    undefined,
    { enabled: true }
  );

  // Note: We'll need to create mutations for tool management
  // For now, showing tools from the tools relation
  const handleRemoveTool = async (toolId: string) => {
    toast.info('Tool removal functionality coming soon. Please use the API to remove tools.');
    // TODO: Implement tool delete mutation
  };

  const handleAddTools = async (toolIds: string[]) => {
    toast.info('Tool addition functionality coming soon. Please use the API to add tools.');
    // TODO: Implement tool create mutation
    setModalOpen(false);
  };

  // Filter to only show active tools
  const activeTools = tools.filter(t => t.isActive);

  if (loadingTools) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tools List */}
      {activeTools.length > 0 ? (
        <div className="space-y-2">
          {activeTools.map(tool => (
            <div
              key={tool.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-2 h-2 rounded-full bg-primary/50" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{tool.name}</p>
                  {tool.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {tool.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => handleRemoveTool(tool.id)}
                disabled={isReconfiguring}
                className="h-8 w-8 p-0 text-sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No tools added yet
        </div>
      )}

      {/* Add Tools Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setModalOpen(true)}
        disabled={isReconfiguring}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add tools
      </Button>

      <ToolsSelectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        selectedToolIds={activeTools.map(t => t.name)} // Use tool names as IDs for now
        onSelect={handleAddTools}
        isLoading={false}
      />
    </div>
  );
}
