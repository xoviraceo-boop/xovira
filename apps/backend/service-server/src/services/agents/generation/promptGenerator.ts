/**
 * Prompt Generator
 * 
 * Generates system prompts for agents following the 7-section framework.
 * Focused service for prompt generation only.
 */

import { openai } from '@/lib/openai';
import { fetchModel } from '@/utils/ai/fetchModel';
import { AgentDraft } from '../agentBuilderStateService';
import { UserContext } from '../agentBuilderContextService';
import { CircuitBreaker, RetryHandler } from '@/utils/circuitBreaker';
import { TokenBudgetManager } from '../optimization/tokenBudgetManager';
import {
  checkAgentTokenLimit,
  estimateTokens,
} from '@/utils/ai/agentUsageTracking';

export class PromptGenerator {
  private readonly circuitBreaker: CircuitBreaker;
  private readonly retryHandler: RetryHandler;
  private readonly tokenBudgetManager: TokenBudgetManager;

  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000,
      halfOpenMaxCalls: 3,
    });
    this.retryHandler = new RetryHandler();
    this.tokenBudgetManager = new TokenBudgetManager();
  }

  /**
   * Generate system prompt following the 7-section framework
   */
  async generate(
    draft: AgentDraft,
    userContext: UserContext
  ): Promise<string> {
    const systemPromptMessages = [
      {
        role: 'system' as const,
        content: `You are a system prompt generator for AI agents. Generate a comprehensive, production-ready system prompt following the 7-section framework:

1. ROLE AND OBJECTIVE (2-4 sentences)
2. CAPABILITIES & SCOPE (bulleted, tool-aware)
3. INSTRUCTIONS (numbered workflows with conditionals)
4. EDGE CASES (failure modes and graceful handling)
5. TONE AND PERSONALITY (descriptive and specific)
6. OUTPUT FORMAT (templates for each response type)
7. CONTEXT (workspace names, users, defaults)

Use markdown headers (##) for each section. Be specific, action-oriented, and include actual workspace context.`,
      },
      {
        role: 'user' as const,
        content: `Generate a system prompt for this agent:

Agent Name: ${draft.name || 'Unnamed Agent'}
Description: ${draft.description || 'No description'}
Agent Type: ${draft.agentType || 'TASK_EXECUTOR'}
Capabilities: ${draft.capabilities?.join(', ') || 'Not specified'}
Constraints: ${draft.constraints?.join(', ') || 'Not specified'}
Tools: ${draft.tools?.map((t: any) => t.name).join(', ') || 'Default tools'}
Rules: ${draft.rules?.map((r: any) => `${r.type}: ${r.condition} → ${r.action}`).join('; ') || 'None'}

Workspace Context:
- Workspace: ${userContext.workspace?.name || userContext.workspaces?.[0]?.name || 'Unknown'}
- Spaces: ${userContext.spaces?.slice(0, 5).map((p: any) => p.name).join(', ') || 'None'}
- Projects: ${userContext.projects?.slice(0, 5).map((p: any) => p.name).join(', ') || 'None'}
- Teams: ${userContext.teams?.slice(0, 5).map((t: any) => t.name).join(', ') || 'None'}

Generate the complete system prompt following the 7-section framework.`,
      },
    ];

    try {
      const model = await fetchModel();
      
      // Use token budget manager for estimation
      const estimatedTokens = this.tokenBudgetManager.estimateTokens(JSON.stringify(systemPromptMessages)) + 2000;
      const budgetCheck = await this.tokenBudgetManager.checkBudget('systemPrompt', estimatedTokens);
      
      // Note: We don't check user token limit here as this is typically called from syncAgentToDatabase
      // which already has context about the user. If needed, userId parameter can be added.
      
      const completion = await this.retryHandler.retry(
        () => this.circuitBreaker.execute(() =>
          openai.chat.completions.create({
            model: model.name,
            messages: systemPromptMessages,
            temperature: 0.7,
            max_tokens: 2000,
          })
        ),
        {
          maxAttempts: 3,
          baseDelay: 1000,
        }
      );

      const generatedPrompt = completion.choices[0]?.message?.content || '';
      if (generatedPrompt && generatedPrompt.length > 100) {
        return generatedPrompt;
      }
    } catch (error) {
      console.error('[PromptGenerator] Failed to generate system prompt:', error);
    }

    // Fallback: return a basic prompt
    return `## Role and Objective
      You are ${draft.name || 'an AI agent'} that ${draft.description || 'helps automate tasks'}.

      ## Capabilities & Scope
      ${draft.capabilities?.map(c => `- ${c}`).join('\n') || '- Process tasks and respond to requests'}

      ## Instructions
      When triggered:
      1. Analyze the request or trigger event
      2. Execute the appropriate actions based on context
      3. Provide clear feedback on actions taken

      ## Edge Cases
      - If data is missing, request clarification
      - If tools are unavailable, gracefully degrade functionality
      - If requests are out of scope, explain limitations

      ## Tone and Personality
      Friendly, direct, and action-oriented. Keep responses clear and concise.

      ## Output Format
      Provide structured responses with clear sections for actions taken and results.

      ## Context
      Operating in ${userContext.workspace?.name || 'the workspace'}.`;
  }
}

