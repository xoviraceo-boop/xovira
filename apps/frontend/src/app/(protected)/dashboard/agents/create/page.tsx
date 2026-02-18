"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from "@/components/layout/Shell";
import { ChatComposer } from '@/entities/chats/components/ChatComposer';
import { AgentSuggestionCard, type AgentSuggestionCardProps } from '@/entities/agents/components/AgentSuggestionCard';
import { AgentTemplateCard, type AgentTemplateCardProps } from '@/entities/agents/components/AgentTemplateCard';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from 'lucide-react';

type AgentTemplate = Omit<AgentTemplateCardProps, 'onClick' | 'disabled'>;

const SUGGESTED_AGENTS: Omit<AgentSuggestionCardProps, 'onClick' | 'disabled'>[] = [
  {
    id: 'blog-creator',
    title: 'Blog Creator',
    description: 'Generates engaging blog posts and content',
    icon: '✍️',
    gradient: 'from-blue-500 to-purple-600',
    message: 'Blog Creator',
  },
  {
    id: 'project-manager',
    title: 'Project Manager',
    description: 'Tracks progress and manages project workflows',
    icon: '📊',
    gradient: 'from-green-500 to-teal-600',
    message: 'Project Management',
  },
  {
    id: 'task-triage',
    title: 'Task Triage',
    description: 'Categorizes and prioritizes new tasks',
    icon: '🎯',
    gradient: 'from-orange-500 to-red-600',
    message: 'Task Triage',
  },
  {
    id: 'content-outliner',
    title: 'Content Outliner',
    description: 'Structures blog content and outlines',
    icon: '📝',
    gradient: 'from-pink-500 to-rose-600',
    message: 'Content Outliner',
  },
];

const AGENT_TEMPLATES: AgentTemplate[] = [
  // Project Management
  {
    id: 'project-reporter',
    title: 'Project Reporter',
    description: 'Summarizes task progress and project status',
    icon: '📈',
    category: 'Project Management',
    message: 'Project Reporter',
  },
  {
    id: 'standup-manager',
    title: 'StandUp Manager',
    description: 'Collects and shares team updates',
    icon: '👥',
    category: 'Project Management',
    message: 'StandUp Manager',
  },
  {
    id: 'priorities-manager',
    title: 'Priorities Manager',
    description: 'Manages priorities and escalates urgent tasks',
    icon: '⚡',
    category: 'Project Management',
    message: 'Priorities Manager',
  },
  {
    id: 'status-reporter',
    title: 'Status Reporter',
    description: 'Auto-generates progress summaries and flags blockers',
    icon: '📊',
    category: 'Project Management',
    message: 'Status Reporter',
  },
  // Teams
  {
    id: 'standup-runner',
    title: 'StandUp Runner',
    description: 'Collects async updates and summarizes blockers',
    icon: '🏃',
    category: 'Teams',
    message: 'StandUp Runner',
  },
  {
    id: 'one-on-one-manager',
    title: '1:1 Management',
    description: 'Preps for one-on-ones with talking points',
    icon: '💬',
    category: 'Teams',
    message: '1:1 Management',
  },
  {
    id: 'activity-updates',
    title: 'Activity Updates',
    description: 'Automated summaries of team activity and progress',
    icon: '📢',
    category: 'Teams',
    message: 'Activity Updates',
  },
  {
    id: 'retro-facilitator',
    title: 'Retro Facilitator',
    description: 'Gathers feedback on what went well or wrong',
    icon: '🔄',
    category: 'Teams',
    message: 'Retro Facilitator',
  },
  // Design
  {
    id: 'social-media-images',
    title: 'Social Media Images',
    description: 'Generates on-brand graphics for any platform',
    icon: '🎨',
    category: 'Design',
    message: 'Social Media Images',
  },
];

export default function AgentCreatePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createAgentMutation = trpc.agent.create.useMutation();
  const initializeBuilderMutation = trpc.agent.builder.initialize.useMutation();
  const messageMutation = trpc.agent.builder.message.useMutation();

  const handleCardClick = async (card: Omit<AgentSuggestionCardProps | AgentTemplateCardProps, 'onClick' | 'disabled'>) => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      // Step 1: Create a new agent
      const agent = await createAgentMutation.mutateAsync({
        name: card.title,
        description: card.description,
        agentType: "TASK_EXECUTOR",
        systemPrompt: `You are a helpful AI agent specialized in ${card.title.toLowerCase()}. We'll configure your instructions in the next steps.`,
        status: "DRAFT",
      });

      // Step 2: Initialize builder conversation
      const builderData = await initializeBuilderMutation.mutateAsync({
        agentId: agent.id,
        skipWelcome: true,  // Skip the welcome message
      });

      // Step 3: Send the first message
      await messageMutation.mutateAsync({
        conversationId: builderData.conversationId,
        message: card.message,
        agentId: agent.id,
      });

      // Step 4: Redirect to the agent builder page
      router.push(`/dashboard/agents/create/${agent.id}`);
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create agent');
      setIsCreating(false);
    }
  };

  const handleSendMessage = async (
    messageText: string,
    options?: { attachments?: any[]; webSearch?: boolean; contexts?: Array<{ type: string; id: string }> }
  ) => {
    if (!messageText.trim() || isCreating) return;

    setIsCreating(true);

    try {
      // Step 1: Create a new agent
      const agent = await createAgentMutation.mutateAsync({
        name: "New Agent",
        description: "",
        agentType: "TASK_EXECUTOR",
        systemPrompt: "You are a helpful AI agent. We'll configure your instructions in the next steps.",
        status: "DRAFT",
      });

      // Step 2: Initialize builder conversation
      const builderData = await initializeBuilderMutation.mutateAsync({
        agentId: agent.id,
        skipWelcome: true,  // Skip the welcome message
      });

      // Step 3: Send the user's message
      await messageMutation.mutateAsync({
        conversationId: builderData.conversationId,
        message: messageText,
        agentId: agent.id,
      });

      // Step 4: Redirect to the agent builder page
      router.push(`/dashboard/agents/create/${agent.id}`);
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create agent');
      setIsCreating(false);
    }
  };

  const handleGetStarted = async () => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      // Create a new agent - conversation and message initialization will be handled by AgentChatBuilder
      const agent = await createAgentMutation.mutateAsync({
        name: "New Agent",
        description: "",
        agentType: "TASK_EXECUTOR",
        systemPrompt: "You are a helpful AI agent. We'll configure your instructions in the next steps.",
        status: "DRAFT",
      });

      // Redirect to the agent builder page - AgentChatBuilder will handle conversation initialization
      router.push(`/dashboard/agents/create/${agent.id}`);
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create agent');
      setIsCreating(false);
    }
  };

  // Group templates by category
  const templatesByCategory = AGENT_TEMPLATES.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, AgentTemplate[]>);

  return (
    <Shell>
      <div className="flex flex-col max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Create AI Agent</h1>
              <p className="text-muted-foreground mt-1">
                What should your new teammate work with you on?
              </p>
            </div>
          </div>
        </div>

        {/* Chat Composer */}
        <div className="mb-12">
          <Card className="border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <ChatComposer
                onSend={handleSendMessage}
                isSending={isCreating}
                disabled={isCreating}
                inputClassName="min-h-[100px]"
              />
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SUGGESTED_AGENTS.map((agent) => (
                  <AgentSuggestionCard
                    key={agent.id}
                    {...agent}
                    onClick={() => handleCardClick(agent)}
                    disabled={isCreating}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Templates by Category */}
        {Object.entries(templatesByCategory).map(([category, templates]) => (
          <div key={category} className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">{category}</h2>
                <p className="text-sm text-muted-foreground">Specialized agents for {category.toLowerCase()}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <AgentTemplateCard
                  key={template.id}
                  {...template}
                  onClick={() => handleCardClick(template)}
                  disabled={isCreating}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Get Started Section */}
        <div className="mb-16 mt-20">
          <Card className="border-2 border-dashed border-border/50 bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                Didn't find what you were looking for?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Describe your perfect Super Agent to our agent builder to get started
              </p>
              <Button
                onClick={handleGetStarted}
                disabled={isCreating}
                size="lg"
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Loading Overlay */}
        {isCreating && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-8 shadow-xl border-2">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="absolute inset-0 h-8 w-8 animate-ping opacity-20">
                    <Loader2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-base">Creating your agent...</p>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    This will just take a moment
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Shell>
  );
}

