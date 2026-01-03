"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/button";
import { Plus, Bot, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";

export default function AgentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const handleCreateAgent = () => {
    router.push('/dashboard/agents/create');
  };

  const { data, isLoading, refetch } = trpc.agent.list.useQuery({
    query: searchQuery || undefined,
    status: statusFilter !== "all" ? [statusFilter as any] : undefined,
    agentType: typeFilter !== "all" ? [typeFilter as any] : undefined,
    includeRelations: true,
  });

  const deleteAgent = trpc.agent.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });


  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="h-8 w-8" />
              AI Agents
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage autonomous AI agents
            </p>
          </div>
          <Button onClick={handleCreateAgent}>
            <Plus className="h-4 w-4 mr-2" />
            Create Agent
            </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="TASK_EXECUTOR">Task Executor</SelectItem>
                  <SelectItem value="WORKFLOW_MANAGER">Workflow Manager</SelectItem>
                  <SelectItem value="DATA_ANALYST">Data Analyst</SelectItem>
                  <SelectItem value="CODE_GENERATOR">Code Generator</SelectItem>
                  <SelectItem value="CONTENT_CREATOR">Content Creator</SelectItem>
                  <SelectItem value="GENERAL_ASSISTANT">General Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Agents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <EmptyState
            title="No agents found"
            message={
              searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first AI agent"
            }
            actionButton={
              <Button onClick={handleCreateAgent}>
                <Plus className="h-4 w-4 mr-2" />
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.items.map((agent) => (
              <Card
                key={agent.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/agents/${agent.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{agent.avatar || "🤖"}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {agent.description || "No description"}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{agent.agentType}</Badge>
                      <Badge
                        variant={
                          agent.status === "ACTIVE"
                            ? "default"
                            : agent.status === "DRAFT"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    {'_count' in agent && (
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {(agent as any)._count?.executions || 0} executions
                        </span>
                        <span>
                          {(agent as any)._count?.tasks || 0} tasks
                        </span>
                      </div>
                    )}
                    {agent.tags && agent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {agent.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{agent.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.total > data.pageSize && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={data.page === 1}
              onClick={() => refetch()}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {data.page} of {Math.ceil(data.total / data.pageSize)}
            </span>
            <Button
              variant="outline"
              disabled={data.page * data.pageSize >= data.total}
              onClick={() => refetch()}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}

