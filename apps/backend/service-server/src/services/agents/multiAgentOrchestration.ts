/**
 * Multi-Agent Orchestration Framework
 *
 * This framework extends the existing single-agent execution system to support
 * complex multi-agent workflows with dependency graphs, inter-agent communication,
 * and composition patterns.
 */

import { StateGraph, END, START } from '@langchain/langgraph';
import { z } from 'zod';

// ===== DATA MODELS =====

/**
 * Agent Node in the orchestration graph
 */
export interface OrchestrationAgent {
  id: string;
  name: string;
  type: 'EXECUTOR' | 'COORDINATOR' | 'SPECIALIST' | 'VALIDATOR';
  capabilities: string[];
  systemPrompt: string;
  tools: string[];
  maxConcurrency: number;
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
}

/**
 * Edge representing data flow between agents
 */
export interface AgentDependency {
  fromAgent: string;
  toAgent: string;
  dataMapping: {
    sourceField: string;
    targetField: string;
    transformation?: string;
  }[];
  condition?: string; // Optional condition for execution
}

/**
 * Communication protocol for inter-agent messaging
 */
export interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  type: 'DATA' | 'SIGNAL' | 'ERROR' | 'HEARTBEAT';
  payload: Record<string, any>;
  timestamp: Date;
  correlationId: string;
}

/**
 * Orchestration execution state
 */
export interface OrchestrationState {
  workflowId: string;
  agents: Map<string, OrchestrationAgent>;
  dependencies: AgentDependency[];
  agentStates: Map<string, {
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'WAITING';
    input: Record<string, any>;
    output?: Record<string, any>;
    error?: string;
    startedAt?: Date;
    completedAt?: Date;
  }>;
  messages: AgentMessage[];
  globalContext: Record<string, any>;
  status: 'INITIALIZING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
}

// ===== COMPOSITION PATTERNS =====

/**
 * Pipeline Pattern: Sequential agent execution
 */
export class PipelinePattern {
  static create(agents: OrchestrationAgent[]): {
    agents: Map<string, OrchestrationAgent>;
    dependencies: AgentDependency[];
  } {
    const agentMap = new Map<string, OrchestrationAgent>();
    const dependencies: AgentDependency[] = [];

    agents.forEach((agent, index) => {
      agentMap.set(agent.id, agent);

      if (index > 0) {
        const prevAgent = agents[index - 1];
        dependencies.push({
          fromAgent: prevAgent.id,
          toAgent: agent.id,
          dataMapping: [{
            sourceField: 'output',
            targetField: 'input'
          }]
        });
      }
    });

    return { agents: agentMap, dependencies };
  }
}

/**
 * Fan-out/Fan-in Pattern: Parallel processing with aggregation
 */
export class FanOutFanInPattern {
  static create(
    coordinator: OrchestrationAgent,
    workers: OrchestrationAgent[],
    aggregator: OrchestrationAgent
  ): {
    agents: Map<string, OrchestrationAgent>;
    dependencies: AgentDependency[];
  } {
    const agentMap = new Map<string, OrchestrationAgent>();
    const dependencies: AgentDependency[] = [];

    // Add all agents
    agentMap.set(coordinator.id, coordinator);
    agentMap.set(aggregator.id, aggregator);
    workers.forEach(worker => agentMap.set(worker.id, worker));

    // Coordinator -> Workers (fan-out)
    workers.forEach(worker => {
      dependencies.push({
        fromAgent: coordinator.id,
        toAgent: worker.id,
        dataMapping: [{
          sourceField: 'taskData',
          targetField: 'input'
        }]
      });
    });

    // Workers -> Aggregator (fan-in)
    workers.forEach(worker => {
      dependencies.push({
        fromAgent: worker.id,
        toAgent: aggregator.id,
        dataMapping: [{
          sourceField: 'result',
          targetField: 'workerResults'
        }]
      });
    });

    return { agents: agentMap, dependencies };
  }
}

/**
 * Coordinator Pattern: Central agent manages specialist agents
 */
export class CoordinatorPattern {
  static create(
    coordinator: OrchestrationAgent,
    specialists: OrchestrationAgent[]
  ): {
    agents: Map<string, OrchestrationAgent>;
    dependencies: AgentDependency[];
  } {
    const agentMap = new Map<string, OrchestrationAgent>();
    const dependencies: AgentDependency[] = [];

    agentMap.set(coordinator.id, coordinator);
    specialists.forEach(specialist => agentMap.set(specialist.id, specialist));

    // Coordinator can call any specialist
    specialists.forEach(specialist => {
      dependencies.push({
        fromAgent: coordinator.id,
        toAgent: specialist.id,
        dataMapping: [{
          sourceField: 'task',
          targetField: 'input'
        }],
        condition: `needs${specialist.type}Capability`
      });
    });

    return { agents: agentMap, dependencies };
  }
}

// ===== EXECUTION PLANNER =====

/**
 * Plans multi-agent execution order and parallelization
 */
export class MultiAgentPlanner {
  /**
   * Analyzes dependencies and creates execution plan
   */
  static createExecutionPlan(
    agents: Map<string, OrchestrationAgent>,
    dependencies: AgentDependency[],
    initialInput: Record<string, any>
  ): {
    executionOrder: string[][]; // Parallel batches
    agentInputs: Map<string, Record<string, any>>;
    estimatedDuration: number;
  } {
    // Build dependency graph
    const graph = this.buildDependencyGraph(dependencies);

    // Perform topological sort to get execution order
    const executionOrder = this.topologicalSort(graph);

    // Calculate agent inputs based on dependencies
    const agentInputs = this.calculateInputs(
      agents,
      dependencies,
      initialInput,
      executionOrder
    );

    // Estimate total duration (simplified)
    const estimatedDuration = Array.from(agents.values())
      .reduce((sum, agent) => sum + agent.timeout, 0);

    return {
      executionOrder,
      agentInputs,
      estimatedDuration
    };
  }

  private static buildDependencyGraph(dependencies: AgentDependency[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();

    dependencies.forEach(dep => {
      if (!graph.has(dep.fromAgent)) {
        graph.set(dep.fromAgent, []);
      }
      if (!graph.has(dep.toAgent)) {
        graph.set(dep.toAgent, []);
      }

      // Add edge: fromAgent -> toAgent
      const existing = graph.get(dep.fromAgent)!;
      if (!existing.includes(dep.toAgent)) {
        existing.push(dep.toAgent);
      }
    });

    return graph;
  }

  private static topologicalSort(graph: Map<string, string[]>): string[][] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const batches: string[][] = [];
    const currentBatch: string[] = [];

    const visit = (node: string) => {
      if (visited.has(node)) return;
      if (visiting.has(node)) {
        throw new Error(`Circular dependency detected involving ${node}`);
      }

      visiting.add(node);

      // Visit all dependencies first
      const dependencies = graph.get(node) || [];
      dependencies.forEach(dep => visit(dep));

      visiting.delete(node);
      visited.add(node);
      currentBatch.push(node);
    };

    // Visit all nodes
    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        currentBatch.length = 0; // Reset for new batch
        visit(node);
        if (currentBatch.length > 0) {
          batches.push([...currentBatch]);
        }
      }
    }

    return batches.reverse(); // Reverse to get execution order
  }

  private static calculateInputs(
    agents: Map<string, OrchestrationAgent>,
    dependencies: AgentDependency[],
    initialInput: Record<string, any>,
    executionOrder: string[][]
  ): Map<string, Record<string, any>> {
    const inputs = new Map<string, Record<string, any>>();
    const agentOutputs = new Map<string, Record<string, any>>();

    // Set initial input for agents with no dependencies
    const allAgentIds = Array.from(agents.keys());
    const dependentAgents = new Set(
      dependencies.map(d => d.toAgent)
    );

    allAgentIds.forEach(agentId => {
      if (!dependentAgents.has(agentId)) {
        inputs.set(agentId, { ...initialInput });
      }
    });

    // Calculate inputs for each batch
    executionOrder.forEach(batch => {
      batch.forEach(agentId => {
        if (inputs.has(agentId)) return; // Already set

        const agentDeps = dependencies.filter(d => d.toAgent === agentId);
        const input: Record<string, any> = {};

        agentDeps.forEach(dep => {
          const sourceOutput = agentOutputs.get(dep.fromAgent);
          if (sourceOutput) {
            dep.dataMapping.forEach(mapping => {
              const value = sourceOutput[mapping.sourceField];
              input[mapping.targetField] = mapping.transformation
                ? this.applyTransformation(value, mapping.transformation)
                : value;
            });
          }
        });

        inputs.set(agentId, input);
      });
    });

    return inputs;
  }

  private static applyTransformation(value: any, transformation: string): any {
    // Simple transformation examples
    switch (transformation) {
      case 'toUpperCase':
        return typeof value === 'string' ? value.toUpperCase() : value;
      case 'length':
        return Array.isArray(value) ? value.length : value;
      default:
        return value;
    }
  }
}

// ===== INTER-AGENT COMMUNICATION =====

/**
 * Message broker for inter-agent communication
 */
export class AgentMessageBroker {
  private subscribers = new Map<string, ((message: AgentMessage) => void)[]>();

  /**
   * Subscribe to messages for a specific agent
   */
  subscribe(agentId: string, callback: (message: AgentMessage) => void): void {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, []);
    }
    this.subscribers.get(agentId)!.push(callback);
  }

  /**
   * Send message to an agent
   */
  async send(message: AgentMessage): Promise<void> {
    const subscribers = this.subscribers.get(message.toAgent) || [];
    await Promise.all(
      subscribers.map(callback => callback(message))
    );
  }

  /**
   * Broadcast message to all agents
   */
  async broadcast(message: Omit<AgentMessage, 'toAgent'>): Promise<void> {
    const allSubscribers = Array.from(this.subscribers.values()).flat();
    await Promise.all(
      allSubscribers.map(callback => callback({ ...message, toAgent: '*' }))
    );
  }
}

/**
 * Communication protocols
 */
export class CommunicationProtocol {
  static async requestData(
    fromAgent: string,
    toAgent: string,
    request: Record<string, any>,
    timeout = 30000
  ): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      const correlationId = `req_${Date.now()}_${Math.random()}`;

      // Send request
      const requestMessage: AgentMessage = {
        id: `msg_${Date.now()}`,
        fromAgent,
        toAgent,
        type: 'DATA',
        payload: { type: 'REQUEST', data: request },
        timestamp: new Date(),
        correlationId
      };

      // Set timeout
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout for ${correlationId}`));
      }, timeout);

      // Listen for response
      // (In real implementation, this would use the message broker)
      // For now, simulate with direct call
      this.handleRequest(requestMessage)
        .then(response => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private static async handleRequest(message: AgentMessage): Promise<Record<string, any>> {
    // Simulate agent processing
    // In real implementation, this would route to the target agent
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time

    return {
      correlationId: message.correlationId,
      data: { result: 'processed', originalRequest: message.payload }
    };
  }
}

// ===== AGENT MARKETPLACE =====

/**
 * Agent Marketplace for discovery and composition
 */
export class AgentMarketplace {
  private agents = new Map<string, OrchestrationAgent>();
  private compositions = new Map<string, {
    name: string;
    description: string;
    pattern: string;
    agents: string[];
    dependencies: AgentDependency[];
    tags: string[];
  }>();

  /**
   * Register an agent in the marketplace
   */
  registerAgent(agent: OrchestrationAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Discover agents by capabilities
   */
  findAgentsByCapability(capability: string): OrchestrationAgent[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.capabilities.includes(capability));
  }

  /**
   * Create and register a composition
   */
  createComposition(
    id: string,
    name: string,
    description: string,
    pattern: string,
    agentIds: string[],
    dependencies: AgentDependency[],
    tags: string[] = []
  ): void {
    // Validate that all agents exist
    const missingAgents = agentIds.filter(id => !this.agents.has(id));
    if (missingAgents.length > 0) {
      throw new Error(`Missing agents: ${missingAgents.join(', ')}`);
    }

    this.compositions.set(id, {
      name,
      description,
      pattern,
      agents: agentIds,
      dependencies,
      tags
    });
  }

  /**
   * Get a composition template
   */
  getComposition(id: string): {
    name: string;
    description: string;
    agents: OrchestrationAgent[];
    dependencies: AgentDependency[];
  } | null {
    const composition = this.compositions.get(id);
    if (!composition) return null;

    return {
      name: composition.name,
      description: composition.description,
      agents: composition.agents.map(id => this.agents.get(id)!),
      dependencies: composition.dependencies
    };
  }

  /**
   * Search compositions by tags or name
   */
  searchCompositions(query: string): Array<{ id: string; name: string; description: string; tags: string[] }> {
    const results = Array.from(this.compositions.entries())
      .filter(([id, comp]) =>
        comp.name.toLowerCase().includes(query.toLowerCase()) ||
        comp.description.toLowerCase().includes(query.toLowerCase()) ||
        comp.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .map(([id, comp]) => ({
        id,
        name: comp.name,
        description: comp.description,
        tags: comp.tags
      }));

    return results;
  }
}

// ===== ORCHESTRATION ENGINE =====

/**
 * Main orchestration engine that coordinates multi-agent execution
 */
export class MultiAgentOrchestrator {
  private messageBroker = new AgentMessageBroker();
  private marketplace = new AgentMarketplace();

  constructor() {
    this.initializeMarketplace();
  }

  private initializeMarketplace(): void {
    // Register some default agents
    this.marketplace.registerAgent({
      id: 'task-creator',
      name: 'Task Creator',
      type: 'EXECUTOR',
      capabilities: ['task_creation', 'project_management'],
      systemPrompt: 'You create tasks based on requirements.',
      tools: ['createTask', 'assignTask'],
      maxConcurrency: 5,
      timeout: 30000,
      retryPolicy: { maxRetries: 3, backoffMs: 1000 }
    });

    this.marketplace.registerAgent({
      id: 'data-analyzer',
      name: 'Data Analyzer',
      type: 'SPECIALIST',
      capabilities: ['data_analysis', 'reporting'],
      systemPrompt: 'You analyze data and generate insights.',
      tools: ['queryData', 'generateReport'],
      maxConcurrency: 2,
      timeout: 60000,
      retryPolicy: { maxRetries: 2, backoffMs: 2000 }
    });

    // Create default compositions
    const pipelineComp = PipelinePattern.create([
      this.marketplace.findAgentsByCapability('task_creation')[0],
      this.marketplace.findAgentsByCapability('data_analysis')[0]
    ]);

    this.marketplace.createComposition(
      'task-analysis-pipeline',
      'Task Analysis Pipeline',
      'Creates tasks and analyzes their impact',
      'pipeline',
      Array.from(pipelineComp.agents.keys()),
      pipelineComp.dependencies,
      ['productivity', 'analysis']
    );
  }

  /**
   * Execute a multi-agent workflow
   */
  async executeWorkflow(
    workflowId: string,
    agents: Map<string, OrchestrationAgent>,
    dependencies: AgentDependency[],
    initialInput: Record<string, any>
  ): Promise<OrchestrationState> {
    const state: OrchestrationState = {
      workflowId,
      agents,
      dependencies,
      agentStates: new Map(),
      messages: [],
      globalContext: { ...initialInput },
      status: 'INITIALIZING'
    };

    try {
      // Create execution plan
      const plan = MultiAgentPlanner.createExecutionPlan(agents, dependencies, initialInput);

      state.status = 'RUNNING';

      // Execute agents in planned order
      for (const batch of plan.executionOrder) {
        const batchPromises = batch.map(async (agentId) => {
          const agent = agents.get(agentId)!;
          const input = plan.agentInputs.get(agentId)!;

          // Update agent state
          state.agentStates.set(agentId, {
            status: 'RUNNING',
            input,
            startedAt: new Date()
          });

          try {
            // Execute agent (simplified - would integrate with existing agent execution)
            const output = await this.executeAgent(agent, input, state);

            // Update state
            state.agentStates.set(agentId, {
              ...state.agentStates.get(agentId)!,
              status: 'COMPLETED',
              output,
              completedAt: new Date()
            });

            // Send completion message
            await this.messageBroker.send({
              id: `msg_${Date.now()}`,
              fromAgent: agentId,
              toAgent: '*', // Broadcast
              type: 'SIGNAL',
              payload: { type: 'COMPLETED', output },
              timestamp: new Date(),
              correlationId: workflowId
            });

          } catch (error) {
            state.agentStates.set(agentId, {
              ...state.agentStates.get(agentId)!,
              status: 'FAILED',
              error: error instanceof Error ? error.message : 'Unknown error',
              completedAt: new Date()
            });
          }
        });

        // Wait for batch to complete
        await Promise.all(batchPromises);
      }

      state.status = 'COMPLETED';

    } catch (error) {
      state.status = 'FAILED';
      state.globalContext.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return state;
  }

  private async executeAgent(
    agent: OrchestrationAgent,
    input: Record<string, any>,
    state: OrchestrationState
  ): Promise<Record<string, any>> {
    // Simplified execution - in real implementation, this would:
    // 1. Create agent execution context
    // 2. Use existing agent execution graph
    // 3. Handle inter-agent communication
    // 4. Apply retry policies

    console.log(`Executing agent ${agent.name} with input:`, input);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, agent.timeout / 10));

    return {
      result: `Processed by ${agent.name}`,
      input,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create workflow from marketplace composition
   */
  createWorkflowFromComposition(
    compositionId: string,
    customizations: Record<string, any> = {}
  ): {
    agents: Map<string, OrchestrationAgent>;
    dependencies: AgentDependency[];
  } | null {
    const composition = this.marketplace.getComposition(compositionId);
    if (!composition) return null;

    // Apply customizations (e.g., parameter overrides)
    const customizedAgents = new Map(
      composition.agents.map(agent => [
        agent.id,
        { ...agent, ...customizations[agent.id] }
      ])
    );

    return {
      agents: customizedAgents,
      dependencies: composition.dependencies
    };
  }

  /**
   * Get available compositions
   */
  getAvailableCompositions(): Array<{ id: string; name: string; description: string; tags: string[] }> {
    return Array.from(this.marketplace['compositions'].values())
      .map(comp => ({
        id: Array.from(this.marketplace['compositions'].keys())
          .find(key => this.marketplace['compositions'].get(key) === comp)!,
        name: comp.name,
        description: comp.description,
        tags: comp.tags
      }));
  }
}

// ===== INTEGRATION WITH EXISTING SYSTEM =====

/**
 * Integration point with existing AgentBuilderService
 */
export class OrchestrationIntegration {
  private orchestrator = new MultiAgentOrchestrator();

  /**
   * Extend agent builder to support orchestration
   */
  async createOrchestratedAgent(
    conversationId: string,
    compositionId: string,
    userId: string
  ): Promise<{
    workflowId: string;
    agents: OrchestrationAgent[];
    executionPlan: any;
  }> {
    // Get composition from marketplace
    const workflow = this.orchestrator.createWorkflowFromComposition(compositionId);
    if (!workflow) {
      throw new Error(`Composition ${compositionId} not found`);
    }

    // Create execution plan
    const plan = MultiAgentPlanner.createExecutionPlan(
      workflow.agents,
      workflow.dependencies,
      {} // Initial input would come from conversation
    );

    const workflowId = `workflow_${Date.now()}`;

    return {
      workflowId,
      agents: Array.from(workflow.agents.values()),
      executionPlan: plan
    };
  }

  /**
   * Execute orchestrated workflow
   */
  async executeOrchestratedWorkflow(
    workflowId: string,
    agents: Map<string, OrchestrationAgent>,
    dependencies: AgentDependency[],
    initialInput: Record<string, any>
  ): Promise<OrchestrationState> {
    return this.orchestrator.executeWorkflow(workflowId, agents, dependencies, initialInput);
  }
}

// ===== USAGE EXAMPLES =====

/*
Example 1: Using Pipeline Pattern

const orchestrator = new MultiAgentOrchestrator();

// Create a simple pipeline
const taskCreator: OrchestrationAgent = {
  id: 'task-creator',
  name: 'Task Creator',
  type: 'EXECUTOR',
  capabilities: ['task_creation'],
  systemPrompt: 'Create tasks from requirements',
  tools: ['createTask'],
  maxConcurrency: 3,
  timeout: 30000,
  retryPolicy: { maxRetries: 3, backoffMs: 1000 }
};

const taskAnalyzer: OrchestrationAgent = {
  id: 'task-analyzer',
  name: 'Task Analyzer',
  type: 'SPECIALIST',
  capabilities: ['analysis'],
  systemPrompt: 'Analyze task impact and dependencies',
  tools: ['analyzeTask'],
  maxConcurrency: 2,
  timeout: 45000,
  retryPolicy: { maxRetries: 2, backoffMs: 2000 }
};

const pipeline = PipelinePattern.create([taskCreator, taskAnalyzer]);

// Execute
const result = await orchestrator.executeWorkflow(
  'pipeline-workflow-123',
  pipeline.agents,
  pipeline.dependencies,
  { requirement: 'Build new feature' }
);

Example 2: Using Marketplace Composition

const compositions = orchestrator.getAvailableCompositions();
// Returns: [{ id: 'task-analysis-pipeline', name: 'Task Analysis Pipeline', ... }]

const workflow = orchestrator.createWorkflowFromComposition('task-analysis-pipeline');
if (workflow) {
  const result = await orchestrator.executeWorkflow(
    'marketplace-workflow-456',
    workflow.agents,
    workflow.dependencies,
    { projectId: 'proj_123' }
  );
}

Example 3: Custom Coordinator Pattern

const coordinator: OrchestrationAgent = {
  id: 'project-coordinator',
  name: 'Project Coordinator',
  type: 'COORDINATOR',
  capabilities: ['coordination', 'planning'],
  systemPrompt: 'Coordinate project tasks and team assignments',
  tools: ['assignTasks', 'createMilestones'],
  maxConcurrency: 1,
  timeout: 60000,
  retryPolicy: { maxRetries: 1, backoffMs: 5000 }
};

const specialists = [
  { id: 'designer', name: 'UI Designer', type: 'SPECIALIST' as const, /* ... * / },
  { id: 'developer', name: 'Developer', type: 'SPECIALIST' as const, /* ... * / },
  { id: 'tester', name: 'QA Tester', type: 'SPECIALIST' as const, /* ... * / }
];

const coordPattern = CoordinatorPattern.create(coordinator, specialists);
*/

export {
  OrchestrationAgent,
  AgentDependency,
  AgentMessage,
  OrchestrationState,
  PipelinePattern,
  FanOutFanInPattern,
  CoordinatorPattern,
  MultiAgentPlanner,
  AgentMessageBroker,
  CommunicationProtocol,
  AgentMarketplace,
  MultiAgentOrchestrator,
  OrchestrationIntegration
};