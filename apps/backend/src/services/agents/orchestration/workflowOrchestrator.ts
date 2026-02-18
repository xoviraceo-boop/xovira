import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { agentRegistryService } from './agentRegistry';
import { agentCommunicationService } from './agentCommunication';

/**
 * Workflow Orchestration Service
 * Executes complex multi-step workflows involving multiple agents
 */

export interface WorkflowStep {
    id: string;
    name: string;
    capability: string;
    requiredTags?: string[];
    condition?: string;
    required: boolean;
    parallel?: boolean;
    timeout?: number;
}

export interface Workflow {
    id: string;
    name: string;
    description?: string;
    steps: WorkflowStep[];
}

export interface WorkflowExecution {
    id: string;
    workflowId: string;
    status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'COMPLETED_CONDITIONAL';
    startTime: Date;
    endTime?: Date;
    context: Record<string, any>;
    error?: string;
}

export interface StepResult {
    stepId: string;
    status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
    result?: any;
    error?: string;
    agentId?: string;
    duration: number;
}

@Injectable()
export class WorkflowOrchestrationService {
    /**
     * Execute a workflow
     */
    async executeWorkflow(workflow: Workflow, input: any, userId: string): Promise<{
        execution: WorkflowExecution;
        output: any;
    }> {
        const execution: WorkflowExecution = {
            id: randomUUID(),
            workflowId: workflow.id,
            status: 'RUNNING',
            startTime: new Date(),
            context: { input },
        };

        try {
            // Execute steps sequentially
            for (const step of workflow.steps) {
                const stepResult = await this.executeStep(step, execution, input, userId);

                // Store step result in context
                execution.context[step.id] = stepResult;

                // Evaluate condition if present
                if (step.condition && !this.evaluateCondition(step.condition, stepResult, execution.context)) {
                    console.log(`[WorkflowOrchestrator] Condition not met for step ${step.id}, stopping workflow`);
                    execution.status = 'COMPLETED_CONDITIONAL';
                    break;
                }

                // Check if step failed
                if (stepResult.status === 'FAILED' && step.required) {
                    execution.status = 'FAILED';
                    execution.error = `Required step ${step.id} failed: ${stepResult.error}`;
                    throw new Error(execution.error);
                }
            }

            if (execution.status === 'RUNNING') {
                execution.status = 'COMPLETED';
            }

            execution.endTime = new Date();

            return {
                execution,
                output: this.extractOutput(execution),
            };
        } catch (error) {
            execution.status = 'FAILED';
            execution.error = error instanceof Error ? error.message : 'Unknown error';
            execution.endTime = new Date();

            console.error(`[WorkflowOrchestrator] Workflow ${workflow.id} failed:`, error);

            throw error;
        } finally {
            // Store execution history
            await this.saveExecution(execution);
        }
    }

    /**
     * Execute a single workflow step
     */
    private async executeStep(
        step: WorkflowStep,
        execution: WorkflowExecution,
        input: any,
        userId: string
    ): Promise<StepResult> {
        const startTime = Date.now();

        try {
            // Find agent with required capability
            const agents = await agentRegistryService.discoverAgents({
                capability: step.capability,
                status: 'ACTIVE',
            });

            // Filter by required tags if specified
            let eligibleAgents = agents;
            if (step.requiredTags && step.requiredTags.length > 0) {
                eligibleAgents = agents.filter((agent) => {
                    const agentTags = agent.metadata?.tags || [];
                    return step.requiredTags!.every((tag) => agentTags.includes(tag));
                });
            }

            if (eligibleAgents.length === 0) {
                return {
                    stepId: step.id,
                    status: 'FAILED',
                    error: `No agent found for capability: ${step.capability}`,
                    duration: Date.now() - startTime,
                };
            }

            // Execute on best agent (for now, just pick first)
            const selectedAgent = await this.selectBestAgent(eligibleAgents);

            console.log(`[WorkflowOrchestrator] Executing step ${step.id} on agent ${selectedAgent.id}`);

            // Execute via agent communication
            const response = await agentCommunicationService.sendMessage(
                execution.id, // Workflow as "agent"
                selectedAgent.id,
                {
                    type: 'REQUEST',
                    content: `Execute workflow step: ${step.name}`,
                    data: {
                        step,
                        input,
                        context: execution.context,
                    },
                },
                {
                    synchronous: true,
                    timeout: step.timeout || 30000,
                }
            );

            if (response.status === 'FAILED') {
                return {
                    stepId: step.id,
                    status: 'FAILED',
                    error: response.error || 'Agent execution failed',
                    agentId: selectedAgent.id,
                    duration: Date.now() - startTime,
                };
            }

            return {
                stepId: step.id,
                status: 'COMPLETED',
                result: response.response,
                agentId: selectedAgent.id,
                duration: Date.now() - startTime,
            };
        } catch (error) {
            return {
                stepId: step.id,
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: Date.now() - startTime,
            };
        }
    }

    /**
     * Select best agent from candidates
     */
    private async selectBestAgent(agents: any[]): Promise<any> {
        // Simple selection: pick first active agent
        // In production, would consider: load, SLA, performance history
        return agents[0];
    }

    /**
     * Evaluate condition expression
     */
    private evaluateCondition(
        condition: string,
        stepResult: StepResult,
        context: Record<string, any>
    ): boolean {
        try {
            // Simple evaluation: check if step succeeded
            if (condition === 'success') {
                return stepResult.status === 'COMPLETED';
            }

            // Could implement more complex expression evaluation here
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Extract final output from execution context
     */
    private extractOutput(execution: WorkflowExecution): any {
        // Return results from all completed steps
        const output: Record<string, any> = {};
        for (const [key, value] of Object.entries(execution.context)) {
            if (key !== 'input' && typeof value === 'object' && value.status === 'COMPLETED') {
                output[key] = value.result;
            }
        }
        return output;
    }

    /**
     * Save execution history
     */
    private async saveExecution(execution: WorkflowExecution): Promise<void> {
        // Store in database (would need WorkflowExecution table)
        // For now, just log
        console.log(`[WorkflowOrchestrator] Workflow ${execution.workflowId} execution ${execution.id} ${execution.status}`);
    }
}

export const workflowOrchestrationService = new WorkflowOrchestrationService();
