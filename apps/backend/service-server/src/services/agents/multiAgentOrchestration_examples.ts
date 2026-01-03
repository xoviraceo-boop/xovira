/**
 * Multi-Agent Orchestration Framework - Usage Examples
 *
 * This file demonstrates how to use the multi-agent orchestration framework
 * with the existing agent builder system.
 */

import { MultiAgentOrchestrator, PipelinePattern, FanOutFanInPattern, CoordinatorPattern } from './multiAgentOrchestration';
import { agentBuilderService } from './agentBuilderService';

// ===== BASIC USAGE EXAMPLES =====

/**
 * Example 1: Create and execute a simple pipeline workflow
 */
async function examplePipelineWorkflow() {
  const orchestrator = new MultiAgentOrchestrator();

  // Define agents for a task creation and analysis pipeline
  const taskCreator = {
    id: 'task-creator',
    name: 'Task Creator Agent',
    type: 'EXECUTOR' as const,
    capabilities: ['task_creation', 'project_management'],
    systemPrompt: 'You create well-structured tasks from requirements. Always include clear acceptance criteria and dependencies.',
    tools: ['createTask', 'assignTask', 'setPriority'],
    maxConcurrency: 3,
    timeout: 30000,
    retryPolicy: { maxRetries: 3, backoffMs: 1000 }
  };

  const taskAnalyzer = {
    id: 'task-analyzer',
    name: 'Task Impact Analyzer',
    type: 'SPECIALIST' as const,
    capabilities: ['data_analysis', 'impact_assessment', 'reporting'],
    systemPrompt: 'You analyze tasks for business impact, resource requirements, and potential risks. Provide detailed assessments.',
    tools: ['analyzeImpact', 'calculateEffort', 'identifyRisks', 'generateReport'],
    maxConcurrency: 2,
    timeout: 45000,
    retryPolicy: { maxRetries: 2, backoffMs: 2000 }
  };

  // Create pipeline pattern
  const pipeline = PipelinePattern.create([taskCreator, taskAnalyzer]);

  // Execute workflow
  const result = await orchestrator.executeWorkflow(
    `pipeline_${Date.now()}`,
    pipeline.agents,
    pipeline.dependencies,
    {
      requirement: 'Implement user authentication system with OAuth2',
      project: 'E-commerce Platform',
      priority: 'HIGH',
      deadline: '2024-02-01'
    }
  );

  console.log('Pipeline execution result:', {
    status: result.status,
    duration: result.agentStates.size > 0 ?
      Math.max(...Array.from(result.agentStates.values())
        .map(s => s.completedAt?.getTime() || 0) -
        Math.min(...Array.from(result.agentStates.values())
          .map(s => s.startedAt?.getTime() || 0))) : 0,
    agentResults: Array.from(result.agentStates.entries()).map(([id, state]) => ({
      agent: id,
      status: state.status,
      output: state.output
    }))
  });

  return result;
}

/**
 * Example 2: Fan-out/Fan-in pattern for parallel processing
 */
async function exampleFanOutFanInWorkflow() {
  const orchestrator = new MultiAgentOrchestrator();

  // Coordinator agent
  const coordinator = {
    id: 'test-coordinator',
    name: 'Test Coordinator',
    type: 'COORDINATOR' as const,
    capabilities: ['coordination', 'test_planning'],
    systemPrompt: 'You coordinate testing activities and distribute test cases across multiple testers.',
    tools: ['planTests', 'distributeWork', 'trackProgress'],
    maxConcurrency: 1,
    timeout: 20000,
    retryPolicy: { maxRetries: 1, backoffMs: 5000 }
  };

  // Worker agents
  const unitTester = {
    id: 'unit-tester',
    name: 'Unit Test Specialist',
    type: 'SPECIALIST' as const,
    capabilities: ['unit_testing', 'code_quality'],
    systemPrompt: 'You execute unit tests and validate code quality metrics.',
    tools: ['runUnitTests', 'checkCoverage', 'validateCode'],
    maxConcurrency: 5,
    timeout: 60000,
    retryPolicy: { maxRetries: 3, backoffMs: 2000 }
  };

  const integrationTester = {
    id: 'integration-tester',
    name: 'Integration Test Specialist',
    type: 'SPECIALIST' as const,
    capabilities: ['integration_testing', 'api_testing'],
    systemPrompt: 'You test system integrations and API endpoints.',
    tools: ['testAPIs', 'checkIntegrations', 'validateDataFlow'],
    maxConcurrency: 3,
    timeout: 90000,
    retryPolicy: { maxRetries: 2, backoffMs: 3000 }
  };

  const performanceTester = {
    id: 'performance-tester',
    name: 'Performance Test Specialist',
    type: 'SPECIALIST' as const,
    capabilities: ['performance_testing', 'load_testing'],
    systemPrompt: 'You conduct performance and load testing.',
    tools: ['runLoadTests', 'measurePerformance', 'analyzeBottlenecks'],
    maxConcurrency: 2,
    timeout: 120000,
    retryPolicy: { maxRetries: 1, backoffMs: 5000 }
  };

  // Aggregator agent
  const aggregator = {
    id: 'test-aggregator',
    name: 'Test Results Aggregator',
    type: 'SPECIALIST' as const,
    capabilities: ['data_aggregation', 'reporting', 'quality_assessment'],
    systemPrompt: 'You aggregate test results and provide comprehensive quality assessments.',
    tools: ['aggregateResults', 'generateReport', 'assessQuality'],
    maxConcurrency: 1,
    timeout: 30000,
    retryPolicy: { maxRetries: 2, backoffMs: 1000 }
  };

  // Create fan-out/fan-in pattern
  const fanOutFanIn = FanOutFanInPattern.create(
    coordinator,
    [unitTester, integrationTester, performanceTester],
    aggregator
  );

  // Execute workflow
  const result = await orchestrator.executeWorkflow(
    `fanout_${Date.now()}`,
    fanOutFanIn.agents,
    fanOutFanIn.dependencies,
    {
      feature: 'User Registration Flow',
      codeChanges: ['auth.js', 'user.js', 'validation.js'],
      testRequirements: {
        unitTests: true,
        integrationTests: true,
        performanceTests: true,
        coverage: 85
      }
    }
  );

  console.log('Fan-out/fan-in execution result:', {
    status: result.status,
    parallelExecution: true,
    agentCount: fanOutFanIn.agents.size,
    results: Array.from(result.agentStates.entries()).map(([id, state]) => ({
      agent: id,
      status: state.status,
      duration: state.startedAt && state.completedAt ?
        state.completedAt.getTime() - state.startedAt.getTime() : 0
    }))
  });

  return result;
}

/**
 * Example 3: Coordinator pattern for conditional execution
 */
async function exampleCoordinatorWorkflow() {
  const orchestrator = new MultiAgentOrchestrator();

  // Coordinator agent
  const projectCoordinator = {
    id: 'project-coordinator',
    name: 'Project Coordinator',
    type: 'COORDINATOR' as const,
    capabilities: ['project_management', 'resource_allocation', 'planning'],
    systemPrompt: 'You analyze project requirements and coordinate appropriate specialists based on task complexity and type.',
    tools: ['analyzeRequirements', 'assignSpecialists', 'createTimeline'],
    maxConcurrency: 1,
    timeout: 25000,
    retryPolicy: { maxRetries: 2, backoffMs: 1000 }
  };

  // Specialist agents
  const frontendSpecialist = {
    id: 'frontend-specialist',
    name: 'Frontend Development Specialist',
    type: 'SPECIALIST' as const,
    capabilities: ['frontend_development', 'ui_ux', 'responsive_design'],
    systemPrompt: 'You handle frontend development tasks including UI/UX implementation and responsive design.',
    tools: ['designUI', 'implementComponents', 'testResponsiveness'],
    maxConcurrency: 4,
    timeout: 60000,
    retryPolicy: { maxRetries: 3, backoffMs: 2000 }
  };

  const backendSpecialist = {
    id: 'backend-specialist',
    name: 'Backend Development Specialist',
    type: 'SPECIALIST' as const,
    capabilities: ['backend_development', 'api_design', 'database_design'],
    systemPrompt: 'You handle backend development including API design, database modeling, and server logic.',
    tools: ['designAPI', 'implementBackend', 'optimizeDatabase'],
    maxConcurrency: 3,
    timeout: 80000,
    retryPolicy: { maxRetries: 2, backoffMs: 3000 }
  };

  const qaSpecialist = {
    id: 'qa-specialist',
    name: 'Quality Assurance Specialist',
    type: 'SPECIALIST' as const,
    capabilities: ['quality_assurance', 'testing', 'bug_tracking'],
    systemPrompt: 'You ensure product quality through comprehensive testing and validation.',
    tools: ['createTestPlans', 'executeTests', 'reportBugs'],
    maxConcurrency: 2,
    timeout: 90000,
    retryPolicy: { maxRetries: 3, backoffMs: 1500 }
  };

  // Create coordinator pattern
  const coordinatorPattern = CoordinatorPattern.create(
    projectCoordinator,
    [frontendSpecialist, backendSpecialist, qaSpecialist]
  );

  // Execute workflow
  const result = await orchestrator.executeWorkflow(
    `coordinator_${Date.now()}`,
    coordinatorPattern.agents,
    coordinatorPattern.dependencies,
    {
      project: 'E-commerce Checkout Redesign',
      requirements: [
        'Modern, responsive UI',
        'Secure payment processing',
        'Inventory management integration',
        'Comprehensive testing coverage'
      ],
      timeline: '4 weeks',
      team: ['john@company.com', 'sarah@company.com', 'mike@company.com']
    }
  );

  console.log('Coordinator execution result:', {
    status: result.status,
    coordinatorDecisions: result.agentStates.get('project-coordinator')?.output,
    specialistAssignments: Array.from(result.agentStates.entries())
      .filter(([id]) => id !== 'project-coordinator')
      .map(([id, state]) => ({
        specialist: id,
        executed: state.status === 'COMPLETED',
        output: state.output
      }))
  });

  return result;
}

/**
 * Example 4: Using marketplace compositions
 */
async function exampleMarketplaceWorkflow() {
  const orchestrator = new MultiAgentOrchestrator();

  // Get available compositions
  const compositions = orchestrator.getAvailableCompositions();
  console.log('Available compositions:', compositions);

  // Use a pre-built composition
  const taskAnalysisComposition = compositions.find(c => c.id === 'task-analysis-pipeline');
  if (taskAnalysisComposition) {
    const workflow = orchestrator.createWorkflowFromComposition('task-analysis-pipeline');
    if (workflow) {
      const result = await orchestrator.executeWorkflow(
        `marketplace_${Date.now()}`,
        workflow.agents,
        workflow.dependencies,
        {
          taskDescription: 'Implement dark mode toggle',
          projectContext: 'User experience enhancement',
          stakeholders: ['design@company.com', 'dev@company.com']
        }
      );

      console.log('Marketplace workflow result:', {
        composition: taskAnalysisComposition.name,
        status: result.status,
        agentsUsed: Array.from(workflow.agents.keys())
      });

      return result;
    }
  }

  throw new Error('Task analysis pipeline composition not found');
}

/**
 * Example 5: Integration with Agent Builder Service
 */
async function exampleAgentBuilderIntegration() {
  const userId = 'user_123';
  const conversationId = 'conv_456';

  try {
    // Create an orchestrated agent using the agent builder
    const orchestratedAgent = await agentBuilderService.createOrchestratedAgent(
      conversationId,
      'task-analysis-pipeline', // composition ID
      userId
    );

    console.log('Created orchestrated agent:', {
      agentId: orchestratedAgent.agentId,
      name: orchestratedAgent.agent.name,
      orchestrationConfig: orchestratedAgent.orchestrationConfig
    });

    // The agent can now be launched like any other agent
    // await agentBuilderService.launchAgent(conversationId, userId);

    return orchestratedAgent;
  } catch (error) {
    console.error('Failed to create orchestrated agent:', error);
    throw error;
  }
}

// ===== EXECUTION EXAMPLES =====

/*
// Run individual examples
examplePipelineWorkflow()
  .then(result => console.log('Pipeline completed'))
  .catch(error => console.error('Pipeline failed:', error));

exampleFanOutFanInWorkflow()
  .then(result => console.log('Fan-out/fan-in completed'))
  .catch(error => console.error('Fan-out/fan-in failed:', error));

exampleCoordinatorWorkflow()
  .then(result => console.log('Coordinator pattern completed'))
  .catch(error => console.error('Coordinator pattern failed:', error));

exampleMarketplaceWorkflow()
  .then(result => console.log('Marketplace workflow completed'))
  .catch(error => console.error('Marketplace workflow failed:', error));

exampleAgentBuilderIntegration()
  .then(result => console.log('Agent builder integration completed'))
  .catch(error => console.error('Agent builder integration failed:', error));
*/

export {
  examplePipelineWorkflow,
  exampleFanOutFanInWorkflow,
  exampleCoordinatorWorkflow,
  exampleMarketplaceWorkflow,
  exampleAgentBuilderIntegration
};