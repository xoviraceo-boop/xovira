/**
 * Conversation Compressor
 * 
 * Compresses conversation history by summarizing older messages
 * to reduce token usage while preserving context.
 */
export class ConversationCompressor {
    /**
     * Compress conversation history
     */
    async compressHistory(
      history: Array<{ role: string; content: string }>,
      maxTokens: number
    ): Promise<Array<{ role: string; content: string }>> {
      if (history.length <= 10) {
        return history;
      }
  
      // Keep recent messages (last 5)
      const recent = history.slice(-5);
      const older = history.slice(0, -5);
  
      // Estimate tokens in recent messages
      const recentTokens = this.estimateTokens(JSON.stringify(recent));
      const availableTokens = maxTokens - recentTokens - 200; // Reserve 200 for summary
  
      if (availableTokens <= 0) {
        // Can't fit even recent messages, return only most recent
        return history.slice(-3);
      }
  
      // Summarize older messages
      const summary = await this.summarizeMessages(older, availableTokens);
  
      return [
        {
          role: 'system',
          content: `Previous conversation summary: ${summary}`,
        },
        ...recent,
      ];
    }
  
    /**
     * Summarize messages (simplified - in production, use AI)
     */
    private async summarizeMessages(
      messages: Array<{ role: string; content: string }>,
      maxLength: number
    ): Promise<string> {
      // Simple summarization: extract key points
      const userMessages = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join(' ');
  
      // Truncate to max length
      if (userMessages.length <= maxLength) {
        return userMessages;
      }
  
      // Take first and last parts
      const firstPart = userMessages.substring(0, Math.floor(maxLength * 0.6));
      const lastPart = userMessages.substring(
        userMessages.length - Math.floor(maxLength * 0.4)
      );
  
      return `${firstPart}... [${messages.length} messages] ...${lastPart}`;
    }
  
    /**
     * Estimate tokens
     */
    private estimateTokens(text: string): number {
      return Math.ceil(text.length / 4);
    }
  }
  
  