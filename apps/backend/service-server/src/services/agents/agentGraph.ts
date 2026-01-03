/**
 * LangGraph State Machine for Agent Execution
 * 
 * This file defines the state machine that orchestrates the agent execution flow:
 * understandIntent → gatherContext → planActions → verifyPlan → (requestApproval?) → executeActions → storeMemory
 */

import { StateGraph, END, START } from '@langchain/langgraph';
import type { AgentState, Context } from './types';
import { understandIntent as understandIntentService } from './intentService';
import { gatherContext as gatherContextService } from './contextService';
import { generatePlan } from './plannerService';
import { verifyPlan as verifyPlanService } from './verificationService';
import { createApprovalRequest } from './approvalService';
import { executeTool } from './toolExecutor';
import { storeMemory as storeMemoryService } from './memoryService';
import { checkGuardrails } from './guardrailService';
import { getAllTools } from './toolRegistry';

/**
 * Agent State Interface
 * This defines the state that flows through the graph
 */
export interface AgentGraphState {
  // Input
  userId: string;
  agentId?: string;
  message: string;
  conversationId?: string;
  workspaceId?: string;
  
  // Intent Understanding
  intent?: {
    action: string;
    parameters: Record<string, any>;
    confidence: number;
    requiresClarification: boolean;
    clarificationQuestions?: string[];
  };
  
  // Context
  context?: Context[];
  
  // Planning
  plan?: {
    id: string;
    steps: Array<{
      id: string;
      description: string;
      type: string;
      dependencies: string[];
      estimatedTime: number;
    }>;
    totalEstimatedTime: number;
    requiresApproval: boolean;
  };
  
  // Verification
  verificationResult?: {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  };
  
  // Approval
  approvalRequest?: {
    id: string;
    reason: string;
    actionSummary: {
      totalActions: number;
      actionTypes: string[];
    };
  };
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  
  // Execution
  executionResults?: Array<{
    stepId: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  
  // Memory
  memoriesToStore?: Array<{
    type: string;
    category: string;
    key: string;
    content: string;
    importance: number;
  }>;
  
  // Output
  response?: string;
  error?: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'WAITING_APPROVAL';
}

/**
 * Node: Understand Intent
 * Converts natural language message to structured intent
 */
async function understandIntent(state: AgentGraphState): Promise<Partial<AgentGraphState>> {
  const conversationHistory: Array<{ role: string; content: string }> = [];
  const intent = await understandIntentService(
    state.message,
    conversationHistory,
    state.workspaceId ? undefined : undefined,
    state.userId
  );
  
  return {
    intent,
    status: 'RUNNING',
  };
}

/**
 * Node: Gather Context
 * Retrieves relevant context from workspace, memory, and rules
 */
async function gatherContext(state: AgentGraphState): Promise<Partial<AgentGraphState>> {
  if (!state.intent) {
    return { error: 'Intent not found', status: 'FAILED' };
  }

  const context = await gatherContextService(
    state.userId,
    state.workspaceId,
    state.intent.action,
    state.intent.parameters
  );

  return {
    context,
  };
}

/**
 * Node: Plan Actions
 * Generates execution plan from intent and context
 */
async function planActions(state: AgentGraphState): Promise<Partial<AgentGraphState>> {
  if (!state.intent || !state.context) {
    return { error: 'Intent or context not found', status: 'FAILED' };
  }

  const availableTools = (await getAllTools()).map((t) => t.name);
  const plan = await generatePlan(state.intent, state.context, availableTools, state.userId);

  return {
    plan,
  };
}

/**
 * Node: Verify Plan
 * Validates the execution plan against guardrails
 */
async function verifyPlan(state: AgentGraphState): Promise<Partial<AgentGraphState>> {
  if (!state.plan) {
    return { error: 'Plan not found', status: 'FAILED' };
  }

  // Check guardrails first
  const guardrailCheck = await checkGuardrails(state.plan, state.userId, state.workspaceId);
  if (!guardrailCheck.passed) {
    return {
      verificationResult: {
        valid: false,
        errors: guardrailCheck.errors,
        warnings: guardrailCheck.warnings,
      },
      error: guardrailCheck.errors.join('; '),
      status: 'FAILED',
    };
  }

  // Verify plan details
  const verificationResult = await verifyPlanService(state.plan, state.userId, state.workspaceId);

  return {
    verificationResult,
  };
}

/**
 * Conditional Edge: Check if approval is required
 */
function requiresApproval(state: AgentGraphState): string {
  if (state.plan?.requiresApproval || state.verificationResult?.warnings?.length) {
    return 'requestApproval';
  }
  return 'executeActions';
}

/**
 * Node: Request Approval
 * Creates approval request and waits for user response
 */
async function requestApproval(state: AgentGraphState): Promise<Partial<AgentGraphState>> {
  if (!state.plan) {
    return { error: 'Plan not found', status: 'FAILED' };
}

  // This would typically use an executionId from state
  const executionId = `exec_${Date.now()}`;
  const approvalRequest = await createApprovalRequest(executionId, state.plan, state.userId);

  return {
    approvalRequest,
    status: 'WAITING_APPROVAL',
  };
}

/**
 * Conditional Edge: Check approval status
 */
function checkApprovalStatus(state: AgentGraphState): string {
  if (state.approvalStatus === 'APPROVED') {
    return 'executeActions';
  }
  if (state.approvalStatus === 'REJECTED') {
    return END;
  }
  return 'requestApproval'; // Still waiting
}

/**
 * Node: Execute Actions
 * Executes the planned actions via tools
 */
async function executeActions(state: AgentGraphState): Promise<Partial<AgentGraphState>> {
  if (!state.plan) {
    return { error: 'Plan not found', status: 'FAILED' };
  }

  const executionResults = [];
  
  for (const step of state.plan.steps) {
    if (step.type === 'EXECUTE' && step.tool) {
      const result = await executeTool(
        {
          toolId: step.tool.name,
          toolName: step.tool.name,
          parameters: step.tool.parameters,
        },
        state.userId
      );

      executionResults.push({
        stepId: step.id,
        success: result.success,
        result: result.result,
        error: result.error,
      });

      // Update step status
      step.status = result.success ? 'COMPLETED' : 'FAILED';
      step.result = result.result;
      step.error = result.error;
    }
  }

  return {
    executionResults,
    status: executionResults.every((r) => r.success) ? 'RUNNING' : 'FAILED',
  };
}

/**
 * Node: Store Memory
 * Saves learnings to memory system
 */
async function storeMemory(state: AgentGraphState): Promise<Partial<AgentGraphState>> {
  if (!state.intent || !state.executionResults) {
    return { error: 'Intent or execution results not found', status: 'FAILED' };
  }

  const agentId = state.agentId || 'global';
  const memoriesToStore = [];

  // Store user preferences if detected
  if (state.intent.parameters.taskParams?.assigneeId) {
    await storeMemoryService(
      agentId,
      'USER_PREFERENCE',
      'assignment',
      `user_${state.userId}_preferred_assignee`,
      `User prefers assigning tasks to ${state.intent.parameters.taskParams.assigneeId}`,
      0.6
    );
    memoriesToStore.push({
      type: 'USER_PREFERENCE',
      category: 'assignment',
      key: `user_${state.userId}_preferred_assignee`,
      content: `User prefers assigning tasks to ${state.intent.parameters.taskParams.assigneeId}`,
      importance: 0.6,
    });
  }

  // Store recent state
  if (state.executionResults && state.executionResults.length > 0) {
    await storeMemoryService(
      agentId,
      'RECENT_STATE',
      'execution',
      `execution_${Date.now()}`,
      `Executed ${state.executionResults.length} actions: ${state.intent.action}`,
      0.5,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days TTL
    );
  }

  return {
    memoriesToStore,
    status: 'COMPLETED',
    response: `Execution completed successfully. ${state.executionResults.length} actions executed.`,
  };
}

/**
 * Build the LangGraph state machine
 */
export function createAgentGraph() {
  const workflow = new StateGraph<AgentGraphState>({
    channels: {
      // Define state channels
      userId: { reducer: (x: string, y?: string) => y ?? x },
      agentId: { reducer: (x: string | undefined, y?: string) => y ?? x },
      message: { reducer: (x: string, y?: string) => y ?? x },
      conversationId: { reducer: (x: string | undefined, y?: string) => y ?? x },
      workspaceId: { reducer: (x: string | undefined, y?: string) => y ?? x },
      intent: { reducer: (x: any, y?: any) => y ?? x },
      context: { reducer: (x: any[], y?: any[]) => y ?? x },
      plan: { reducer: (x: any, y?: any) => y ?? x },
      verificationResult: { reducer: (x: any, y?: any) => y ?? x },
      approvalRequest: { reducer: (x: any, y?: any) => y ?? x },
      approvalStatus: { reducer: (x: any, y?: any) => y ?? x },
      executionResults: { reducer: (x: any[], y?: any[]) => y ?? x },
      memoriesToStore: { reducer: (x: any[], y?: any[]) => y ?? x },
      response: { reducer: (x: string | undefined, y?: string) => y ?? x },
      error: { reducer: (x: string | undefined, y?: string) => y ?? x },
      status: { reducer: (x: string, y?: string) => y ?? x },
    },
  });

  // Add nodes
  workflow.addNode('understandIntent', understandIntent);
  workflow.addNode('gatherContext', gatherContext);
  workflow.addNode('planActions', planActions);
  workflow.addNode('verifyPlan', verifyPlan);
  workflow.addNode('requestApproval', requestApproval);
  workflow.addNode('executeActions', executeActions);
  workflow.addNode('storeMemory', storeMemory);

  // Define edges
  workflow.addEdge(START, 'understandIntent');
  workflow.addEdge('understandIntent', 'gatherContext');
  workflow.addEdge('gatherContext', 'planActions');
  workflow.addEdge('planActions', 'verifyPlan');
  workflow.addConditionalEdges('verifyPlan', requiresApproval, {
    requestApproval: 'requestApproval',
    executeActions: 'executeActions',
  });
  workflow.addConditionalEdges('requestApproval', checkApprovalStatus, {
    executeActions: 'executeActions',
    requestApproval: 'requestApproval',
    [END]: END,
  });
  workflow.addEdge('executeActions', 'storeMemory');
  workflow.addEdge('storeMemory', END);

  return workflow.compile();
}

/**
 * Types export for use in other services
 */
export type { AgentGraphState };

