import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { eventBus } from '../core/eventBus';
import { agentRegistryService } from './agentRegistry';
import { agentExecutionService } from './agentExecutionService';

/**
 * Agent Communication Service
 * Enables secure, policy-controlled agent-to-agent messaging
 */

export interface AgentMessage {
    content: string;
    type: 'REQUEST' | 'RESPONSE' | 'NOTIFICATION';
    data?: Record<string, any>;
}

export interface MessageEnvelope {
    id: string;
    from: string;
    to: string;
    message: AgentMessage;
    timestamp: Date;
    ttl: number;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    requireAck: boolean;
    correlationId?: string;
}

export interface CommunicationOptions {
    ttl?: number;
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
    requireAck?: boolean;
    synchronous?: boolean;
    timeout?: number;
}

export interface AgentResponse {
    messageId: string;
    status: 'QUEUED' | 'DELIVERED' | 'FAILED';
    response?: any;
    error?: string;
}

@Injectable()
export class AgentCommunicationService {
    private pendingResponses: Map<string, (response: any) => void> = new Map();

    /**
     * Send message from one agent to another
     */
    async sendMessage(
        fromAgentId: string,
        toAgentId: string,
        message: AgentMessage,
        options: CommunicationOptions = {}
    ): Promise<AgentResponse> {
        // Create message envelope
        const envelope: MessageEnvelope = {
            id: randomUUID(),
            from: fromAgentId,
            to: toAgentId,
            message,
            timestamp: new Date(),
            ttl: options.ttl || 60000, // 1 minute default
            priority: options.priority || 'NORMAL',
            requireAck: options.requireAck !== false,
        };

        // Validate both agents exist
        const [fromAgent, toAgent] = await Promise.all([
            agentRegistryService.getAgent(fromAgentId),
            agentRegistryService.getAgent(toAgentId),
        ]);

        if (!fromAgent) {
            return {
                messageId: envelope.id,
                status: 'FAILED',
                error: `Sender agent not found: ${fromAgentId}`,
            };
        }

        if (!toAgent) {
            return {
                messageId: envelope.id,
                status: 'FAILED',
                error: `Recipient agent not found: ${toAgentId}`,
            };
        }

        // Check if communication is allowed (basic policy check)
        const allowed = await this.checkCommunicationPolicy(fromAgent, toAgent);
        if (!allowed) {
            return {
                messageId: envelope.id,
                status: 'FAILED',
                error: 'Communication not allowed by policy',
            };
        }

        // Publish message to agent inbox via event bus
        await eventBus.publish(`agent.${toAgentId}.inbox`, envelope);

        console.log(`[AgentComm] Message sent from ${fromAgentId} to ${toAgentId}: ${envelope.id}`);

        // Wait for response if synchronous
        if (options.synchronous) {
            return await this.waitForResponse(envelope.id, options.timeout || 30000);
        }

        return {
            messageId: envelope.id,
            status: 'QUEUED',
        };
    }

    /**
     * Subscribe to agent inbox
     */
    subscribeToInbox(agentId: string): void {
        eventBus.subscribe(`agent.${agentId}.inbox`, async (envelope: MessageEnvelope) => {
            try {
                console.log(`[AgentComm] Agent ${agentId} received message from ${envelope.from}`);

                // Execute agent with message
                const result = await agentExecutionService.executeAgent({
                    agentId,
                    userId: 'system',
                    inputData: {
                        fromAgent: envelope.from,
                        message: envelope.message,
                    },
                    executionContext: {
                        messageId: envelope.id,
                        fromAgentId: envelope.from,
                    },
                });

                // Send response if acknowledgement required
                if (envelope.requireAck) {
                    await this.sendResponse(envelope.id, result);
                }
            } catch (error) {
                console.error(`[AgentComm] Error processing message for agent ${agentId}:`, error);
                await this.sendError(envelope.id, error instanceof Error ? error.message : 'Unknown error');
            }
        });

        console.log(`[AgentComm] Agent ${agentId} subscribed to inbox`);
    }

    /**
     * Send response to a message
     */
    private async sendResponse(messageId: string, response: any): Promise<void> {
        eventBus.publish(`agent.response.${messageId}`, {
            messageId,
            response,
            timestamp: new Date(),
        });

        // Resolve pending promise if exists
        const resolver = this.pendingResponses.get(messageId);
        if (resolver) {
            resolver(response);
            this.pendingResponses.delete(messageId);
        }
    }

    /**
     * Send error response
     */
    private async sendError(messageId: string, error: string): Promise<void> {
        eventBus.publish(`agent.response.${messageId}`, {
            messageId,
            error,
            timestamp: new Date(),
        });

        // Reject pending promise if exists
        const resolver = this.pendingResponses.get(messageId);
        if (resolver) {
            resolver({ error });
            this.pendingResponses.delete(messageId);
        }
    }

    /**
     * Wait for response to a message
     */
    private async waitForResponse(messageId: string, timeout: number): Promise<AgentResponse> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.pendingResponses.delete(messageId);
                resolve({
                    messageId,
                    status: 'FAILED',
                    error: 'Response timeout',
                });
            }, timeout);

            // Subscribe to response
            eventBus.subscribe(`agent.response.${messageId}`, (data: any) => {
                clearTimeout(timeoutId);
                this.pendingResponses.delete(messageId);

                if (data.error) {
                    resolve({
                        messageId,
                        status: 'FAILED',
                        error: data.error,
                    });
                } else {
                    resolve({
                        messageId,
                        status: 'DELIVERED',
                        response: data.response,
                    });
                }
            });

            this.pendingResponses.set(messageId, (response) => {
                clearTimeout(timeoutId);
                resolve({
                    messageId,
                    status: 'DELIVERED',
                    response,
                });
            });
        });
    }

    /**
     * Check if communication is allowed between agents (basic policy)
     */
    private async checkCommunicationPolicy(fromAgent: any, toAgent: any): Promise<boolean> {
        // Basic policy: agents must be in same workspace or one must be global
        if (fromAgent.workspaceId && toAgent.workspaceId) {
            return fromAgent.workspaceId === toAgent.workspaceId;
        }
        return true; // Allow if at least one is global
    }
}

export const agentCommunicationService = new AgentCommunicationService();
