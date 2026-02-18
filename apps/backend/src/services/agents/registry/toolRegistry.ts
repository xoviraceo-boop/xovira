/**
 * Tool Registry
 * 
 * Registers all automation tools available to AI agents
 * Based on automation-tools.md documentation
 * 
 * Tools are stored in database (SystemTool model) and loaded from there.
 * This file contains the default tool definitions that are synced to the database.
 */

import { Tool } from '../types/types';
import { prisma } from '@/lib/prisma';
import type { Tool as ToolType } from '../types/types';
import { randomUUID } from 'crypto';
import {
  CONTENT_CREATION_TOOLS,
  CODE_OPERATION_TOOLS,
  BROWSER_AUTOMATION_TOOLS,
  MEDIA_GENERATION_TOOLS,
  FILE_OPERATION_TOOLS,
} from './skillTools';

// Tool definition type (without id - id is auto-generated in database)
type ToolDefinition = Omit<Tool, 'id'>;

// Default Tools
const DEFAULT_TOOLS: ToolDefinition[] = [
  {
    name: 'createSchedule',
    description: 'Create a scheduled task or automation that runs at specified intervals or times',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'createSchedule',
      description: 'Create a scheduled task or automation',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID where schedule will be created' },
          name: { type: 'string', description: 'Name of the schedule' },
          description: { type: 'string', description: 'Description of what the schedule does' },
          cronExpression: { type: 'string', description: 'Cron expression defining schedule (e.g., "0 9 * * *" for daily at 9 AM)' },
          timezone: { type: 'string', description: 'Timezone for schedule (default: UTC)' },
          enabled: { type: 'boolean', description: 'Whether schedule is enabled (default: true)' },
          action: {
            type: 'object',
            description: 'Action to execute when schedule triggers',
            properties: {
              type: { type: 'string', description: 'Action type (e.g., "CREATE_TASK", "SEND_NOTIFICATION")' },
              parameters: { type: 'object', description: 'Action-specific parameters' },
            },
          },
        },
        required: ['workspaceId', 'name', 'cronExpression', 'action'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 10,
    examples: [
      {
        input: {
          workspaceId: 'ws_123',
          name: 'Daily Standup Reminder',
          cronExpression: '0 9 * * 1-5',
          timezone: 'America/New_York',
          action: { type: 'SEND_NOTIFICATION', parameters: { channel: 'general', message: 'Time for daily standup!' } },
        },
        output: { id: 'schedule_456', workspaceId: 'ws_123', name: 'Daily Standup Reminder' },
        description: 'Create a daily standup reminder schedule',
      },
    ],
  },
  {
    name: 'loadAssetsAndObjects',
    description: 'Load assets, files, and objects from workspace storage or external sources',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'loadAssetsAndObjects',
      description: 'Load assets and objects',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          assetType: { type: 'string', enum: ['FILE', 'IMAGE', 'DOCUMENT', 'VIDEO', 'AUDIO'], description: 'Type of asset to load' },
          source: { type: 'string', enum: ['WORKSPACE', 'EXTERNAL_URL', 'CLOUD_STORAGE'], description: 'Source location' },
          path: { type: 'string', description: 'Path within workspace (for WORKSPACE source)' },
          url: { type: 'string', description: 'External URL (for EXTERNAL_URL source)' },
          storageProvider: { type: 'string', description: 'Cloud storage provider (for CLOUD_STORAGE source)' },
          includeMetadata: { type: 'boolean', description: 'Include file metadata (default: true)' },
          limit: { type: 'number', description: 'Maximum number of assets to load (default: 100)' },
        },
        required: ['workspaceId', 'assetType', 'source'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          workspaceId: 'ws_123',
          assetType: 'DOCUMENT',
          source: 'WORKSPACE',
          path: '/documents/project-docs',
          limit: 50,
        },
        output: { assets: [], total: 0, loaded: 0 },
        description: 'Load documents from workspace',
      },
    ],
  },
  {
    name: 'retrieveChatMessages',
    description: 'Retrieve chat messages from workspace channels, direct messages, or agent conversations',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'retrieveChatMessages',
      description: 'Retrieve chat messages',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          channelId: { type: 'string', description: 'Channel ID (for channel messages)' },
          conversationId: { type: 'string', description: 'Conversation ID (for direct messages)' },
          agentId: { type: 'string', description: 'Agent ID (for agent conversations)' },
          userId: { type: 'string', description: 'User ID (for user-specific messages)' },
          limit: { type: 'number', description: 'Maximum number of messages (default: 50, max: 200)' },
          before: { type: 'string', description: 'Message ID to fetch messages before (pagination)' },
          after: { type: 'string', description: 'Message ID to fetch messages after (pagination)' },
          includeAttachments: { type: 'boolean', description: 'Include message attachments (default: false)' },
        },
        required: ['workspaceId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 60,
    examples: [
      {
        input: {
          workspaceId: 'ws_123',
          channelId: 'channel_789',
          limit: 100,
        },
        output: { messages: [], total: 0, hasMore: false },
        description: 'Retrieve channel messages',
      },
    ],
  },
  {
    name: 'postReply',
    description: 'Post a reply to a chat message, comment, or conversation thread',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'postReply',
      description: 'Post a reply',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          messageId: { type: 'string', description: 'ID of message to reply to' },
          content: { type: 'string', description: 'Reply content (max 10000 characters)' },
          channelId: { type: 'string', description: 'Channel ID (if replying in channel)' },
          conversationId: { type: 'string', description: 'Conversation ID (if replying in DM)' },
          mentions: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs to mention' },
          attachments: { type: 'array', items: { type: 'string' }, description: 'Array of attachment IDs' },
          isPrivate: { type: 'boolean', description: 'Whether reply is private (default: false)' },
        },
        required: ['workspaceId', 'messageId', 'content'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          workspaceId: 'ws_123',
          messageId: 'msg_456',
          content: 'Thanks for the update!',
        },
        output: { id: 'reply_789', messageId: 'msg_456', content: 'Thanks for the update!' },
        description: 'Post a reply to a message',
      },
    ],
  },
  {
    name: 'retrieveTaskList',
    description: 'Retrieve a list of tasks with optional filtering and pagination',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'retrieveTaskList',
      description: 'Retrieve task list',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID filter' },
          spaceId: { type: 'string', description: 'Space ID filter' },
          projectId: { type: 'string', description: 'Project ID filter' },
          teamId: { type: 'string', description: 'Team ID filter' },
          listId: { type: 'string', description: 'List ID filter' },
          assigneeId: { type: 'string', description: 'Assignee user ID filter' },
          status: { type: 'array', items: { type: 'string' }, description: 'Array of status values to filter by' },
          query: { type: 'string', description: 'Search query for task title/description' },
          page: { type: 'number', description: 'Page number (default: 1)' },
          pageSize: { type: 'number', description: 'Items per page (default: 12, max: 50)' },
          scope: { type: 'string', enum: ['owned', 'assigned', 'all'], description: 'Scope filter (default: owned)' },
          includeRelations: { type: 'boolean', description: 'Include related data (default: false)' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 60,
    examples: [
      {
        input: {
          workspaceId: 'ws_123',
          projectId: 'proj_456',
          status: ['TODO', 'IN_PROGRESS'],
          page: 1,
          pageSize: 20,
        },
        output: { items: [], total: 0, page: 1, pageSize: 20 },
        description: 'Retrieve tasks in a project',
      },
    ],
  },
];

// Search Tools
const SEARCH_TOOLS: ToolDefinition[] = [
  {
    name: 'searchWorkspaces',
    description: 'Search for workspaces by name, description, or other criteria',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchWorkspaces',
      description: 'Search workspaces',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
          includePublic: { type: 'boolean', description: 'Include public workspaces (default: true)' },
          includePrivate: { type: 'boolean', description: 'Include private workspaces user has access to (default: true)' },
        },
        required: ['query'],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: { query: 'development team', limit: 10 },
        output: { workspaces: [], total: 0 },
        description: 'Search for workspaces',
      },
    ],
  },
  {
    name: 'searchProjects',
    description: 'Search for projects within workspace or across all accessible workspaces',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchProjects',
      description: 'Search projects',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Limit search to specific workspace' },
          query: { type: 'string', description: 'Search query' },
          status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED', 'COMPLETED'], description: 'Filter by status' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
          includeArchived: { type: 'boolean', description: 'Include archived projects (default: false)' },
        },
        required: ['query'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: { workspaceId: 'ws_123', query: 'mobile app', status: 'ACTIVE', limit: 20 },
        output: { projects: [], total: 0 },
        description: 'Search projects',
      },
    ],
  },
  {
    name: 'searchTeams',
    description: 'Search for teams within workspace or across accessible workspaces',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchTeams',
      description: 'Search teams',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Limit search to specific workspace' },
          query: { type: 'string', description: 'Search query' },
          status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'], description: 'Filter by status' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
        },
        required: ['query'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: { workspaceId: 'ws_123', query: 'engineering', limit: 15 },
        output: { teams: [], total: 0 },
        description: 'Search teams',
      },
    ],
  },
  {
    name: 'searchProposals',
    description: 'Search for proposals in marketplace or within workspace',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchProposals',
      description: 'Search proposals',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Limit search to workspace proposals' },
          query: { type: 'string', description: 'Search query' },
          category: { type: 'string', enum: ['COFOUNDER', 'MENTOR', 'CUSTOMER', 'INVESTOR', 'PARTNER', 'MEMBERSHIP'], description: 'Filter by category' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], description: 'Filter by status' },
          intent: { type: 'string', enum: ['SEEKING', 'OFFERING'], description: 'Filter by intent' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
        },
        required: ['query'],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: { query: 'AI development', category: 'PARTNER', status: 'PUBLISHED', limit: 20 },
        output: { proposals: [], total: 0 },
        description: 'Search proposals',
      },
    ],
  },
  {
    name: 'searchSpaces',
    description: 'Search for spaces within a workspace',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchSpaces',
      description: 'Search spaces',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
        },
        required: ['workspaceId', 'query'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: { workspaceId: 'ws_123', query: 'development', limit: 10 },
        output: { spaces: [], total: 0 },
        description: 'Search spaces',
      },
    ],
  },
  {
    name: 'searchWorkspace',
    description: 'Search for a specific workspace by ID or unique identifier',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchWorkspace',
      description: 'Search workspace',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID to retrieve' },
          includeDetails: { type: 'boolean', description: 'Include detailed information (default: true)' },
        },
        required: ['workspaceId'],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 60,
    examples: [
      {
        input: { workspaceId: 'ws_123', includeDetails: true },
        output: { id: 'ws_123', name: 'Workspace Name' },
        description: 'Get workspace details',
      },
    ],
  },
  {
    name: 'searchProject',
    description: 'Search for a specific project by ID',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchProject',
      description: 'Search project',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID to retrieve' },
          includeDetails: { type: 'boolean', description: 'Include detailed information (default: true)' },
        },
        required: ['projectId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 60,
    examples: [
      {
        input: { projectId: 'proj_456', includeDetails: true },
        output: { id: 'proj_456', name: 'Project Name' },
        description: 'Get project details',
      },
    ],
  },
  {
    name: 'searchTeam',
    description: 'Search for a specific team by ID',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchTeam',
      description: 'Search team',
      parameters: {
        type: 'object',
        properties: {
          teamId: { type: 'string', description: 'Team ID to retrieve' },
          includeDetails: { type: 'boolean', description: 'Include detailed information (default: true)' },
        },
        required: ['teamId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 60,
    examples: [
      {
        input: { teamId: 'team_789', includeDetails: true },
        output: { id: 'team_789', name: 'Team Name' },
        description: 'Get team details',
      },
    ],
  },
  {
    name: 'searchProposal',
    description: 'Search for a specific proposal by ID',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchProposal',
      description: 'Search proposal',
      parameters: {
        type: 'object',
        properties: {
          proposalId: { type: 'string', description: 'Proposal ID to retrieve' },
          includeDetails: { type: 'boolean', description: 'Include detailed information (default: true)' },
        },
        required: ['proposalId'],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 60,
    examples: [
      {
        input: { proposalId: 'prop_123', includeDetails: true },
        output: { id: 'prop_123', title: 'Proposal Title' },
        description: 'Get proposal details',
      },
    ],
  },
  {
    name: 'searchSpace',
    description: 'Search for a specific space by ID',
    category: 'SEARCH',
    isDefault: true,
    functionSchema: {
      name: 'searchSpace',
      description: 'Search space',
      parameters: {
        type: 'object',
        properties: {
          spaceId: { type: 'string', description: 'Space ID to retrieve' },
          includeDetails: { type: 'boolean', description: 'Include detailed information (default: true)' },
        },
        required: ['spaceId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 60,
    examples: [
      {
        input: { spaceId: 'space_456', includeDetails: true },
        output: { id: 'space_456', name: 'Space Name' },
        description: 'Get space details',
      },
    ],
  },
];

// Task Management Tools
const TASK_MANAGEMENT_TOOLS: ToolDefinition[] = [
  {
    name: 'addTaskToList',
    description: 'Add an existing task to one or more lists',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'addTaskToList',
      description: 'Add task to lists',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to add to lists' },
          listIds: { type: 'array', items: { type: 'string' }, description: 'Array of list IDs to add task to' },
          workspaceId: { type: 'string', description: 'Workspace ID for validation' },
        },
        required: ['taskId', 'listIds'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: { taskId: 'task_123', listIds: ['list_456', 'list_789'] },
        output: { taskId: 'task_123', addedToListIds: ['list_456', 'list_789'] },
        description: 'Add task to multiple lists',
      },
    ],
  },
  {
    name: 'createTask',
    description: 'Create a new task in the workspace',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'createTask',
      description: 'Create a new task',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          spaceId: { type: 'string', description: 'Space ID' },
          projectId: { type: 'string', description: 'Project ID' },
          teamId: { type: 'string', description: 'Team ID' },
          listId: { type: 'string', description: 'List ID' },
          title: { type: 'string', description: 'Task title (max 500 characters)' },
          description: { type: 'string', description: 'Task description (max 10000 characters)' },
          assigneeIds: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs to assign' },
          agentIds: { type: 'array', items: { type: 'string' }, description: 'Array of agent IDs to assign' },
          status: { type: 'string', description: 'Initial status' },
          visibility: { type: 'string', enum: ['PRIVATE', 'TEAM', 'WORKSPACE', 'PUBLIC'], description: 'Visibility level (default: PRIVATE)' },
          isPublic: { type: 'boolean', description: 'Whether task is public (default: false)' },
          parentId: { type: 'string', description: 'Parent task ID (for subtasks)' },
        },
        required: ['title'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          workspaceId: 'ws_123',
          projectId: 'proj_456',
          title: 'Review PR #123',
          description: 'Review the pull request',
          assigneeIds: ['user_789'],
          status: 'TODO',
        },
        output: { id: 'task_456', title: 'Review PR #123' },
        description: 'Create a task',
      },
    ],
  },
  {
    name: 'createSubtask',
    description: 'Create a subtask under a parent task',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'createSubtask',
      description: 'Create a subtask',
      parameters: {
        type: 'object',
        properties: {
          parentId: { type: 'string', description: 'Parent task ID' },
          title: { type: 'string', description: 'Subtask title (max 500 characters)' },
          description: { type: 'string', description: 'Subtask description' },
          assigneeIds: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs to assign' },
          agentIds: { type: 'array', items: { type: 'string' }, description: 'Array of agent IDs to assign' },
          status: { type: 'string', description: 'Initial status' },
        },
        required: ['parentId', 'title'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          parentId: 'task_123',
          title: 'Write unit tests',
          description: 'Add tests for new feature',
          assigneeIds: ['user_456'],
        },
        output: { id: 'subtask_789', title: 'Write unit tests', parentId: 'task_123' },
        description: 'Create a subtask',
      },
    ],
  },
  {
    name: 'moveToList',
    description: 'Move a task from one list to another',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'moveToList',
      description: 'Move task to list',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to move' },
          targetListId: { type: 'string', description: 'Target list ID' },
          removeFromCurrentList: { type: 'boolean', description: 'Remove from current list (default: true)' },
          preserveStatus: { type: 'boolean', description: 'Preserve task status (default: false)' },
        },
        required: ['taskId', 'targetListId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: { taskId: 'task_123', targetListId: 'list_456', removeFromCurrentList: true },
        output: { taskId: 'task_123', previousListId: 'list_789', newListId: 'list_456' },
        description: 'Move task to another list',
      },
    ],
  },
  {
    name: 'postTaskComment',
    description: 'Post a comment on a task',
    category: 'TASK_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'postTaskComment',
      description: 'Post task comment',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID' },
          content: { type: 'string', description: 'Comment content (max 10000 characters)' },
          mentions: { type: 'array', items: { type: 'string' }, description: 'Array of user IDs to mention' },
          isPrivate: { type: 'boolean', description: 'Whether comment is private (default: false)' },
          attachments: { type: 'array', items: { type: 'string' }, description: 'Array of attachment IDs' },
        },
        required: ['taskId', 'content'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          taskId: 'task_123',
          content: 'This looks good! Ready to merge.',
          mentions: ['user_456'],
        },
        output: { id: 'comment_789', taskId: 'task_123', content: 'This looks good! Ready to merge.' },
        description: 'Post a comment on a task',
      },
    ],
  },
  {
    name: 'updateTaskComment',
    description: 'Update an existing task comment',
    category: 'TASK_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'updateTaskComment',
      description: 'Update task comment',
      parameters: {
        type: 'object',
        properties: {
          commentId: { type: 'string', description: 'Comment ID' },
          content: { type: 'string', description: 'Updated comment content (max 10000 characters)' },
          mentions: { type: 'array', items: { type: 'string' }, description: 'Updated array of user IDs to mention' },
        },
        required: ['commentId', 'content'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: { commentId: 'comment_123', content: 'Updated: This looks great!' },
        output: { id: 'comment_123', content: 'Updated: This looks great!' },
        description: 'Update a task comment',
      },
    ],
  },
  {
    name: 'updateTask',
    description: 'Update an existing task\'s properties',
    category: 'TASK_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'updateTask',
      description: 'Update a task',
      parameters: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID' },
          title: { type: 'string', description: 'New title' },
          description: { type: 'string', description: 'New description' },
          status: { type: 'string', description: 'New status' },
          assigneeIds: { type: 'array', items: { type: 'string' }, description: 'New array of user assignee IDs' },
          agentIds: { type: 'array', items: { type: 'string' }, description: 'New array of agent assignee IDs' },
          projectId: { type: 'string', description: 'New project ID' },
          teamId: { type: 'string', description: 'New team ID' },
          listId: { type: 'string', description: 'New list ID' },
          visibility: { type: 'string', enum: ['PRIVATE', 'TEAM', 'WORKSPACE', 'PUBLIC'], description: 'New visibility level' },
          isPublic: { type: 'boolean', description: 'New public status' },
          parentId: { type: 'string', description: 'New parent task ID' },
        },
        required: ['taskId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          taskId: 'task_123',
          status: 'IN_PROGRESS',
          assigneeIds: ['user_456', 'user_789'],
        },
        output: { id: 'task_123', status: 'IN_PROGRESS', assignees: [] },
        description: 'Update a task',
      },
    ],
  },
];

// Project Management Tools
const PROJECT_MANAGEMENT_TOOLS: ToolDefinition[] = [
  {
    name: 'createProject',
    description: 'Create a new project in the workspace',
    category: 'PROJECT_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'createProject',
      description: 'Create a project',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          name: { type: 'string', description: 'Project name (max 200 characters)' },
          description: { type: 'string', description: 'Project description (max 5000 characters)' },
          spaceId: { type: 'string', description: 'Space ID to associate with' },
          visibility: { type: 'string', enum: ['PRIVATE', 'TEAM', 'WORKSPACE', 'PUBLIC'], description: 'Visibility level (default: PRIVATE)' },
          isPublic: { type: 'boolean', description: 'Whether project is public (default: false)' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Array of tag strings' },
          metadata: { type: 'object', description: 'Additional metadata' },
        },
        required: ['workspaceId', 'name'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 20,
    examples: [
      {
        input: {
          workspaceId: 'ws_123',
          name: 'Mobile App Development',
          description: 'Building a new mobile application',
          tags: ['mobile', 'ios', 'android'],
        },
        output: { id: 'proj_456', name: 'Mobile App Development' },
        description: 'Create a project',
      },
    ],
  },
  {
    name: 'updateProject',
    description: 'Update an existing project\'s properties',
    category: 'PROJECT_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'updateProject',
      description: 'Update a project',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID' },
          name: { type: 'string', description: 'New name' },
          description: { type: 'string', description: 'New description' },
          status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED', 'COMPLETED'], description: 'New status' },
          visibility: { type: 'string', enum: ['PRIVATE', 'TEAM', 'WORKSPACE', 'PUBLIC'], description: 'New visibility level' },
          isPublic: { type: 'boolean', description: 'New public status' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Updated tags' },
          metadata: { type: 'object', description: 'Updated metadata' },
        },
        required: ['projectId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 20,
    examples: [
      {
        input: { projectId: 'proj_456', status: 'COMPLETED', description: 'Project completed successfully' },
        output: { id: 'proj_456', status: 'COMPLETED' },
        description: 'Update a project',
      },
    ],
  },
  {
    name: 'postProjectActivities',
    description: 'Post activity updates to a project\'s activity feed',
    category: 'PROJECT_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'postProjectActivities',
      description: 'Post project activities',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID' },
          type: { type: 'string', enum: ['UPDATE', 'MILESTONE', 'NOTE', 'STATUS_CHANGE'], description: 'Activity type' },
          content: { type: 'string', description: 'Activity content (max 5000 characters)' },
          metadata: { type: 'object', description: 'Additional activity metadata' },
          isPublic: { type: 'boolean', description: 'Whether activity is public (default: false)' },
        },
        required: ['projectId', 'type', 'content'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          projectId: 'proj_456',
          type: 'MILESTONE',
          content: 'Reached 50% completion milestone',
        },
        output: { id: 'activity_789', projectId: 'proj_456', type: 'MILESTONE' },
        description: 'Post project activity',
      },
    ],
  },
  {
    name: 'reportProjectKPIs',
    description: 'Generate and retrieve KPI reports for a project',
    category: 'PROJECT_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'reportProjectKPIs',
      description: 'Report project KPIs',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID' },
          metrics: {
            type: 'array',
            items: { type: 'string', enum: ['TASK_COMPLETION', 'TEAM_VELOCITY', 'BURNDOWN', 'CYCLE_TIME', 'LEAD_TIME'] },
            description: 'Specific metrics to include',
          },
          startDate: { type: 'string', description: 'Start date for report (ISO8601)' },
          endDate: { type: 'string', description: 'End date for report (ISO8601)' },
          format: { type: 'string', enum: ['JSON', 'CSV', 'PDF'], description: 'Report format (default: JSON)' },
        },
        required: ['projectId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 60,
    rateLimit: 10,
    examples: [
      {
        input: {
          projectId: 'proj_456',
          metrics: ['TASK_COMPLETION', 'TEAM_VELOCITY'],
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
        },
        output: { projectId: 'proj_456', metrics: {}, reportDate: '2024-01-31T00:00:00Z' },
        description: 'Generate project KPI report',
      },
    ],
  },
  {
    name: 'publishProjectToMarketplace',
    isDefault: false,
    description: 'Publish a project to the marketplace for discovery by other users',
    category: 'PROJECT_MANAGEMENT',
    functionSchema: {
      name: 'publishProjectToMarketplace',
      description: 'Publish project to marketplace',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID to publish' },
          marketplaceVisibility: { type: 'string', enum: ['PUBLIC', 'LIMITED'], description: 'Marketplace visibility (default: PUBLIC)' },
          pricing: {
            type: 'object',
            description: 'Pricing information',
            properties: {
              type: { type: 'string', enum: ['FREE', 'PAID', 'CUSTOM'] },
              amount: { type: 'number' },
            },
          },
          tags: { type: 'array', items: { type: 'string' }, description: 'Marketplace tags for discovery' },
        },
        required: ['projectId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 5,
    examples: [
      {
        input: {
          projectId: 'proj_456',
          marketplaceVisibility: 'PUBLIC',
          tags: ['mobile', 'development', 'ios'],
        },
        output: { projectId: 'proj_456', marketplaceId: 'mp_123', publishedAt: '2024-01-15T00:00:00Z' },
        description: 'Publish project to marketplace',
      },
    ],
  },
];

// Team Management Tools
const TEAM_MANAGEMENT_TOOLS: ToolDefinition[] = [
  {
    name: 'createTeam',
    description: 'Create a new team in the workspace',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'createTeam',
      description: 'Create a team',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          name: { type: 'string', description: 'Team name (max 200 characters)' },
          description: { type: 'string', description: 'Team description (max 5000 characters)' },
          spaceId: { type: 'string', description: 'Space ID to associate with' },
          memberIds: { type: 'array', items: { type: 'string' }, description: 'Initial member user IDs' },
          visibility: { type: 'string', enum: ['PRIVATE', 'TEAM', 'WORKSPACE', 'PUBLIC'], description: 'Visibility level (default: PRIVATE)' },
          isPublic: { type: 'boolean', description: 'Whether team is public (default: false)' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Array of tag strings' },
        },
        required: ['workspaceId', 'name'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 20,
    examples: [
      {
        input: {
          workspaceId: 'ws_123',
          name: 'Engineering Team',
          description: 'Core engineering team',
          memberIds: ['user_456', 'user_789'],
        },
        output: { id: 'team_789', name: 'Engineering Team', memberCount: 2 },
        description: 'Create a team',
      },
    ],
  },
  {
    name: 'updateTeam',
    description: 'Update an existing team\'s properties',
    category: 'TASK_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'updateTeam',
      description: 'Update a team',
      parameters: {
        type: 'object',
        properties: {
          teamId: { type: 'string', description: 'Team ID' },
          name: { type: 'string', description: 'New name' },
          description: { type: 'string', description: 'New description' },
          status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'], description: 'New status' },
          visibility: { type: 'string', enum: ['PRIVATE', 'TEAM', 'WORKSPACE', 'PUBLIC'], description: 'New visibility level' },
          isPublic: { type: 'boolean', description: 'New public status' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Updated tags' },
          addMemberIds: { type: 'array', items: { type: 'string' }, description: 'User IDs to add to team' },
          removeMemberIds: { type: 'array', items: { type: 'string' }, description: 'User IDs to remove from team' },
        },
        required: ['teamId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 20,
    examples: [
      {
        input: { teamId: 'team_789', description: 'Updated team description', addMemberIds: ['user_123'] },
        output: { id: 'team_789', description: 'Updated team description' },
        description: 'Update a team',
      },
    ],
  },
  {
    name: 'postTeamActivities',
    description: 'Post activity updates to a team\'s activity feed',
    category: 'TASK_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'postTeamActivities',
      description: 'Post team activities',
      parameters: {
        type: 'object',
        properties: {
          teamId: { type: 'string', description: 'Team ID' },
          type: { type: 'string', enum: ['UPDATE', 'MILESTONE', 'NOTE', 'MEMBER_JOINED', 'MEMBER_LEFT'], description: 'Activity type' },
          content: { type: 'string', description: 'Activity content (max 5000 characters)' },
          metadata: { type: 'object', description: 'Additional activity metadata' },
          isPublic: { type: 'boolean', description: 'Whether activity is public (default: false)' },
        },
        required: ['teamId', 'type', 'content'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          teamId: 'team_789',
          type: 'MILESTONE',
          content: 'Team reached 100 completed tasks',
        },
        output: { id: 'activity_123', teamId: 'team_789', type: 'MILESTONE' },
        description: 'Post team activity',
      },
    ],
  },
  {
    name: 'reportTeamKPIs',
    description: 'Generate and retrieve KPI reports for a team',
    category: 'TASK_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'reportTeamKPIs',
      description: 'Report team KPIs',
      parameters: {
        type: 'object',
        properties: {
          teamId: { type: 'string', description: 'Team ID' },
          metrics: {
            type: 'array',
            items: { type: 'string', enum: ['TASK_COMPLETION', 'TEAM_VELOCITY', 'MEMBER_CONTRIBUTION', 'COLLABORATION_SCORE'] },
            description: 'Specific metrics to include',
          },
          startDate: { type: 'string', description: 'Start date for report (ISO8601)' },
          endDate: { type: 'string', description: 'End date for report (ISO8601)' },
          format: { type: 'string', enum: ['JSON', 'CSV', 'PDF'], description: 'Report format (default: JSON)' },
        },
        required: ['teamId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 60,
    rateLimit: 10,
    examples: [
      {
        input: {
          teamId: 'team_789',
          metrics: ['TASK_COMPLETION', 'MEMBER_CONTRIBUTION'],
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
        },
        output: { teamId: 'team_789', metrics: {}, reportDate: '2024-01-31T00:00:00Z' },
        description: 'Generate team KPI report',
      },
    ],
  },
  {
    name: 'publishTeamToMarketplace',
    description: 'Publish a team to the marketplace for discovery by other users',
    category: 'TASK_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'publishTeamToMarketplace',
      description: 'Publish team to marketplace',
      parameters: {
        type: 'object',
        properties: {
          teamId: { type: 'string', description: 'Team ID to publish' },
          marketplaceVisibility: { type: 'string', enum: ['PUBLIC', 'LIMITED'], description: 'Marketplace visibility (default: PUBLIC)' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Marketplace tags for discovery' },
        },
        required: ['teamId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 5,
    examples: [
      {
        input: {
          teamId: 'team_789',
          marketplaceVisibility: 'PUBLIC',
          tags: ['engineering', 'development', 'remote'],
        },
        output: { teamId: 'team_789', marketplaceId: 'mp_456', publishedAt: '2024-01-15T00:00:00Z' },
        description: 'Publish team to marketplace',
      },
    ],
  },
];

// Profile Management Tools
const PROFILE_MANAGEMENT_TOOLS: ToolDefinition[] = [
  {
    name: 'updateProfile',
    description: 'Update user profile information',
    category: 'USER_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'updateProfile',
      description: 'Update profile',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID (default: current user)' },
          name: { type: 'string', description: 'Updated name' },
          bio: { type: 'string', description: 'Updated bio (max 1000 characters)' },
          avatar: { type: 'string', description: 'Updated avatar URL' },
          location: { type: 'string', description: 'Updated location' },
          website: { type: 'string', description: 'Updated website URL' },
          skills: { type: 'array', items: { type: 'string' }, description: 'Updated array of skills' },
          socialLinks: { type: 'object', description: 'Updated social media links' },
          preferences: { type: 'object', description: 'Updated user preferences' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 20,
    examples: [
      {
        input: {
          bio: 'Full-stack developer passionate about AI',
          skills: ['JavaScript', 'Python', 'React', 'Node.js'],
          location: 'San Francisco, CA',
        },
        output: { id: 'user_123', bio: 'Full-stack developer passionate about AI' },
        description: 'Update user profile',
      },
    ],
  },
  {
    name: 'publishProfileToMarketplace',
    description: 'Publish user profile to marketplace for talent discovery',
    category: 'USER_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'publishProfileToMarketplace',
      description: 'Publish profile to marketplace',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID (default: current user)' },
          marketplaceVisibility: { type: 'string', enum: ['PUBLIC', 'LIMITED'], description: 'Marketplace visibility (default: PUBLIC)' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Marketplace tags for discovery' },
          availability: { type: 'string', enum: ['AVAILABLE', 'BUSY', 'UNAVAILABLE'], description: 'Availability status' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 5,
    examples: [
      {
        input: {
          marketplaceVisibility: 'PUBLIC',
          tags: ['developer', 'full-stack', 'ai'],
          availability: 'AVAILABLE',
        },
        output: { userId: 'user_123', marketplaceId: 'mp_789', publishedAt: '2024-01-15T00:00:00Z' },
        description: 'Publish profile to marketplace',
      },
    ],
  },
];

// Proposal Management Tools
const PROPOSAL_MANAGEMENT_TOOLS: ToolDefinition[] = [
  {
    name: 'createProposal',
    description: 'Create a new proposal for marketplace or workspace',
    category: 'TASK_MANAGEMENT',
    isDefault: true,
    functionSchema: {
      name: 'createProposal',
      description: 'Create a proposal',
      parameters: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          title: { type: 'string', description: 'Proposal title (max 200 characters)' },
          shortSummary: { type: 'string', description: 'Short summary (max 500 characters)' },
          detailedDesc: { type: 'string', description: 'Detailed description (max 10000 characters)' },
          category: { type: 'string', enum: ['COFOUNDER', 'MENTOR', 'CUSTOMER', 'INVESTOR', 'PARTNER', 'MEMBERSHIP'], description: 'Category' },
          intent: { type: 'string', enum: ['SEEKING', 'OFFERING'], description: 'Intent' },
          projectId: { type: 'string', description: 'Associated project ID' },
          teamId: { type: 'string', description: 'Associated team ID' },
          visibility: { type: 'string', enum: ['PRIVATE', 'TEAM', 'WORKSPACE', 'PUBLIC'], description: 'Visibility level (default: PUBLIC)' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED'], description: 'Initial status (default: DRAFT)' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Array of tag strings' },
          keywords: { type: 'array', items: { type: 'string' }, description: 'Array of keywords for search' },
        },
        required: ['title', 'shortSummary', 'detailedDesc', 'category', 'intent'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 20,
    examples: [
      {
        input: {
          workspaceId: 'ws_123',
          title: 'Seeking Co-founder for AI Startup',
          shortSummary: 'Looking for technical co-founder',
          detailedDesc: 'We are building an AI-powered platform...',
          category: 'COFOUNDER',
          intent: 'SEEKING',
          tags: ['ai', 'startup', 'cofounder'],
        },
        output: { id: 'prop_123', title: 'Seeking Co-founder for AI Startup' },
        description: 'Create a proposal',
      },
    ],
  },
  {
    name: 'updateProposal',
    description: 'Update an existing proposal\'s properties',
    category: 'TASK_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'updateProposal',
      description: 'Update a proposal',
      parameters: {
        type: 'object',
        properties: {
          proposalId: { type: 'string', description: 'Proposal ID' },
          title: { type: 'string', description: 'Updated title' },
          shortSummary: { type: 'string', description: 'Updated short summary' },
          detailedDesc: { type: 'string', description: 'Updated detailed description' },
          status: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], description: 'Updated status' },
          visibility: { type: 'string', enum: ['PRIVATE', 'TEAM', 'WORKSPACE', 'PUBLIC'], description: 'Updated visibility level' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Updated tags' },
          keywords: { type: 'array', items: { type: 'string' }, description: 'Updated keywords' },
        },
        required: ['proposalId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 20,
    examples: [
      {
        input: {
          proposalId: 'prop_123',
          status: 'PUBLISHED',
          tags: ['ai', 'startup', 'cofounder', 'remote'],
        },
        output: { id: 'prop_123', status: 'PUBLISHED' },
        description: 'Update a proposal',
      },
    ],
  },
  {
    name: 'publishProposalToMarketplace',
    description: 'Publish a proposal to the marketplace (if not already published)',
    category: 'TASK_MANAGEMENT',
    isDefault: false,
    functionSchema: {
      name: 'publishProposalToMarketplace',
      description: 'Publish proposal to marketplace',
      parameters: {
        type: 'object',
        properties: {
          proposalId: { type: 'string', description: 'Proposal ID to publish' },
          marketplaceVisibility: { type: 'string', enum: ['PUBLIC', 'LIMITED'], description: 'Marketplace visibility (default: PUBLIC)' },
        },
        required: ['proposalId'],
      },
    },
    deterministic: true,
    requiresAuth: true,
    timeout: 30,
    rateLimit: 5,
    examples: [
      {
        input: { proposalId: 'prop_123', marketplaceVisibility: 'PUBLIC' },
        output: { proposalId: 'prop_123', marketplaceId: 'mp_456', publishedAt: '2024-01-15T00:00:00Z' },
        description: 'Publish proposal to marketplace',
      },
    ],
  },
];

// Marketplace Tools
const MARKETPLACE_TOOLS: ToolDefinition[] = [
  {
    name: 'findTalents',
    description: 'Search for talents/profiles in the marketplace',
    category: 'SEARCH',
    isDefault: false,
    functionSchema: {
      name: 'findTalents',
      description: 'Find talents',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          skills: { type: 'array', items: { type: 'string' }, description: 'Filter by skills' },
          location: { type: 'string', description: 'Filter by location' },
          availability: { type: 'string', enum: ['AVAILABLE', 'BUSY', 'UNAVAILABLE'], description: 'Filter by availability' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          query: 'full-stack developer',
          skills: ['JavaScript', 'React', 'Node.js'],
          availability: 'AVAILABLE',
          limit: 20,
        },
        output: { talents: [], total: 0, page: 1 },
        description: 'Find talents',
      },
    ],
  },
  {
    name: 'findTools',
    description: 'Search for tools in the marketplace',
    category: 'SEARCH',
    isDefault: false,
    functionSchema: {
      name: 'findTools',
      description: 'Find tools',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          category: { type: 'string', description: 'Filter by category' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
          pricing: { type: 'string', enum: ['FREE', 'PAID', 'FREEMIUM'], description: 'Filter by pricing' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          query: 'project management',
          category: 'PRODUCTIVITY',
          pricing: 'FREE',
          limit: 15,
        },
        output: { tools: [], total: 0, page: 1 },
        description: 'Find tools',
      },
    ],
  },
  {
    name: 'findMaterials',
    description: 'Search for materials/documents in the marketplace',
    category: 'SEARCH',
    isDefault: false,
    functionSchema: {
      name: 'findMaterials',
      description: 'Find materials',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          type: { type: 'string', enum: ['DOCUMENT', 'TEMPLATE', 'GUIDE', 'TUTORIAL'], description: 'Filter by material type' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          query: 'project template',
          type: 'TEMPLATE',
          limit: 20,
        },
        output: { materials: [], total: 0, page: 1 },
        description: 'Find materials',
      },
    ],
  },
  {
    name: 'findResources',
    description: 'Search for various resources in the marketplace',
    category: 'SEARCH',
    isDefault: false,
    functionSchema: {
      name: 'findResources',
      description: 'Find resources',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          resourceType: { type: 'string', description: 'Filter by resource type' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          query: 'design assets',
          resourceType: 'ASSETS',
          limit: 15,
        },
        output: { resources: [], total: 0, page: 1 },
        description: 'Find resources',
      },
    ],
  },
  {
    name: 'findProjects',
    description: 'Search for published projects in the marketplace',
    category: 'SEARCH',
    isDefault: false,
    functionSchema: {
      name: 'findProjects',
      description: 'Find projects',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
          status: { type: 'string', enum: ['ACTIVE', 'COMPLETED'], description: 'Filter by status' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          query: 'mobile app',
          tags: ['ios', 'android'],
          limit: 20,
        },
        output: { projects: [], total: 0, page: 1 },
        description: 'Find projects',
      },
    ],
  },
  {
    name: 'findTeams',
    description: 'Search for published teams in the marketplace',
    category: 'SEARCH',
    isDefault: false,
    functionSchema: {
      name: 'findTeams',
      description: 'Find teams',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          query: 'engineering',
          tags: ['remote', 'full-stack'],
          limit: 15,
        },
        output: { teams: [], total: 0, page: 1 },
        description: 'Find teams',
      },
    ],
  },
  {
    name: 'findTasks',
    description: 'Search for published tasks in the marketplace',
    category: 'SEARCH',
    isDefault: false,
    functionSchema: {
      name: 'findTasks',
      description: 'Find tasks',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED'], description: 'Filter by status' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
          limit: { type: 'number', description: 'Maximum results (default: 20, max: 100)' },
          page: { type: 'number', description: 'Page number (default: 1)' },
        },
        required: [],
      },
    },
    deterministic: true,
    requiresAuth: false,
    timeout: 30,
    rateLimit: 30,
    examples: [
      {
        input: {
          query: 'web development',
          status: 'OPEN',
          limit: 20,
        },
        output: { tasks: [], total: 0, page: 1 },
        description: 'Find tasks',
      },
    ],
  },
];

/**
 * Get all tool definitions from code (used for syncing to database)
 */
export function getAllToolDefinitions(): ToolDefinition[] {
  return [
    ...DEFAULT_TOOLS,
    ...SEARCH_TOOLS,
    ...TASK_MANAGEMENT_TOOLS,
    ...PROJECT_MANAGEMENT_TOOLS,
    ...TEAM_MANAGEMENT_TOOLS,
    ...PROFILE_MANAGEMENT_TOOLS,
    ...PROPOSAL_MANAGEMENT_TOOLS,
    ...MARKETPLACE_TOOLS,
    ...CONTENT_CREATION_TOOLS,
    ...CODE_OPERATION_TOOLS,
    ...BROWSER_AUTOMATION_TOOLS,
    ...MEDIA_GENERATION_TOOLS,
    ...FILE_OPERATION_TOOLS,
  ];
}

/**
 * Sync all tool definitions to database
 * This should be called on startup or when tools are updated
 */
export async function syncToolsToDatabase(): Promise<void> {
  const toolDefinitions = getAllToolDefinitions();

  for (const toolDef of toolDefinitions) {
    const now = new Date();
    await prisma.systemTool.upsert({
      where: { name: toolDef.name },
      update: {
        description: toolDef.description,
        category: toolDef.category,
        functionSchema: toolDef.functionSchema as any,
        deterministic: toolDef.deterministic,
        requiresAuth: toolDef.requiresAuth,
        rateLimit: toolDef.rateLimit,
        timeout: toolDef.timeout,
        examples: toolDef.examples as any,
        isDefault: toolDef.isDefault ?? false,
        isBuiltIn: true,
        isActive: true,
        updatedAt: now,
      },
      create: {
        id: randomUUID(),
        name: toolDef.name,
        description: toolDef.description,
        category: toolDef.category,
        functionSchema: toolDef.functionSchema as any,
        deterministic: toolDef.deterministic,
        requiresAuth: toolDef.requiresAuth,
        rateLimit: toolDef.rateLimit,
        timeout: toolDef.timeout,
        examples: toolDef.examples as any,
        isDefault: toolDef.isDefault ?? false,
        isBuiltIn: true,
        isActive: true,
        updatedAt: now,
      },
    });
  }
}

/**
 * Get all registered tools from database
 */
export async function getAllTools(): Promise<Tool[]> {
  const dbTools = await prisma.systemTool.findMany({
    where: { isActive: true },
  });

  return dbTools.map(tool => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category as ToolType['category'],
    functionSchema: tool.functionSchema as any,
    deterministic: tool.deterministic,
    requiresAuth: tool.requiresAuth,
    rateLimit: tool.rateLimit ?? undefined,
    timeout: tool.timeout,
    examples: tool.examples as any,
  }));
}

/**
 * Get all tools synchronously (for backward compatibility, uses in-memory definitions)
 * Note: This will be deprecated in favor of getAllTools() which loads from database
 */
export function getAllToolsSync(): Tool[] {
  const definitions = getAllToolDefinitions();
  // Generate temporary IDs for backward compatibility
  return definitions.map((def, index) => ({
    id: `temp_${index}_${def.name}`,
    ...def,
  }));
}

/**
 * Get tool by name or ID from database
 */
export async function getToolByName(toolName: string): Promise<Tool | undefined> {
  const tool = await prisma.systemTool.findUnique({
    where: { name: toolName },
  });

  if (!tool) return undefined;

  return {
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category as ToolType['category'],
    functionSchema: tool.functionSchema as any,
    deterministic: tool.deterministic,
    requiresAuth: tool.requiresAuth,
    rateLimit: tool.rateLimit ?? undefined,
    timeout: tool.timeout,
    examples: tool.examples as any,
  };
}

/**
 * Get tool by ID (deprecated - use getToolByName instead)
 */
export async function getToolById(toolId: string): Promise<Tool | undefined> {
  // First try to find by ID
  const tool = await prisma.systemTool.findUnique({
    where: { id: toolId },
  });

  if (tool) {
    return {
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category as ToolType['category'],
      functionSchema: tool.functionSchema as any,
      deterministic: tool.deterministic,
      requiresAuth: tool.requiresAuth,
      rateLimit: tool.rateLimit ?? undefined,
      timeout: tool.timeout,
      examples: tool.examples as any,
    };
  }

  // Fallback: try to find by name
  return getToolByName(toolId);
}

/**
 * Get tools by category from database
 */
export async function getToolsByCategory(category: string): Promise<Tool[]> {
  const tools = await prisma.systemTool.findMany({
    where: {
      category,
      isActive: true,
    },
  });

  return tools.map(tool => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category as ToolType['category'],
    functionSchema: tool.functionSchema as any,
    deterministic: tool.deterministic,
    requiresAuth: tool.requiresAuth,
    rateLimit: tool.rateLimit ?? undefined,
    timeout: tool.timeout,
    examples: tool.examples as any,
  }));
}
