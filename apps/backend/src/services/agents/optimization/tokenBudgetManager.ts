/**
 * Token Budget Manager
 * 
 * Manages token usage budgets per operation stage to control costs
 * and optimize AI API calls.
 */

import { ConversationCompressor } from './conversationCompressor';

export interface TokenBudget {
  extraction: number;
  automation: number;
  stageProgression: number;
  readiness: number;
  response: number;
  systemPrompt: number;
}

export interface BudgetCheckResult {
  allowed: boolean;
  estimated: number;
  budget: number;
  recommendation?: string;
}

export class TokenBudgetManager {
  private readonly BUDGETS: TokenBudget = {
    extraction: 1000,
    automation: 1200,
    stageProgression: 300,
    readiness: 400,
    response: 5000,
    systemPrompt: 2000,
  };

  private compressor: ConversationCompressor;

  constructor() {
    this.compressor = new ConversationCompressor();
  }

  /**
   * Check if estimated tokens are within budget for a stage
   */
  async checkBudget(
    stage: keyof TokenBudget,
    estimatedTokens: number
  ): Promise<BudgetCheckResult> {
    const budget = this.BUDGETS[stage] || 1000;

    if (estimatedTokens > budget) {
      return {
        allowed: false,
        estimated: estimatedTokens,
        budget,
        recommendation: `Estimated tokens (${estimatedTokens}) exceed budget (${budget}) for ${stage}. Consider compressing input or reducing context.`,
      };
    }

    return {
      allowed: true,
      estimated: estimatedTokens,
      budget,
    };
  }

  /**
   * Compress conversation history if it exceeds budget
   */
  async compressIfNeeded(
    history: Array<{ role: string; content: string }>,
    maxTokens: number
  ): Promise<Array<{ role: string; content: string }>> {
    // Estimate tokens in current history
    const estimated = this.estimateTokens(JSON.stringify(history));

    if (estimated <= maxTokens) {
      return history;
    }

    // Compress history
    return await this.compressor.compressHistory(history, maxTokens);
  }

  /**
   * Estimate tokens in a string (rough approximation)
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    // This is a simple approximation - for production, use tiktoken or similar
    return Math.ceil(text.length / 4);
  }

  /**
   * Get budget for a stage
   */
  getBudget(stage: keyof TokenBudget): number {
    return this.BUDGETS[stage];
  }

  /**
   * Update budget for a stage (for dynamic adjustment)
   */
  updateBudget(stage: keyof TokenBudget, newBudget: number): void {
    this.BUDGETS[stage] = newBudget;
  }
}

