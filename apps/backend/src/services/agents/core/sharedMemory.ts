import { Injectable } from '@nestjs/common';
import { openai } from '@/lib/openai';
import { randomUUID } from 'crypto';

/**
 * Shared Memory Service
 * Enables cross-agent knowledge sharing via vector embeddings
 */

export interface SharedMemory {
    id: string;
    agentId: string;
    type: 'fact' | 'experience' | 'pattern';
    content: string;
    scope: 'workspace' | 'project' | 'global';
    timestamp: Date;
    accessCount: number;
    importance: number;
    embedding?: number[];
}

@Injectable()
export class SharedMemoryService {
    private memories: Map<string, SharedMemory> = new Map();
    private embeddingCache: Map<string, number[]> = new Map();

    /**
     * Share a memory (store with embedding)
     */
    async share(
        agentId: string,
        memoryType: 'fact' | 'experience' | 'pattern',
        content: string,
        scope: 'workspace' | 'project' | 'global',
        importance: number = 0.5
    ): Promise<string> {
        const memory: SharedMemory = {
            id: randomUUID(),
            agentId,
            type: memoryType,
            content,
            scope,
            timestamp: new Date(),
            accessCount: 0,
            importance,
            embedding: await this.embed(content),
        };

        // Store in memory map (in production, would use vector DB like Pinecone, Weaviate, Qdrant)
        this.memories.set(memory.id, memory);

        console.log(`[SharedMemory] Agent ${agentId} shared ${memoryType} in ${scope} scope`);

        return memory.id;
    }

    /**
     * Query memories via semantic search
     */
    async query(
        agentId: string,
        query: string,
        scopes: Array<'workspace' | 'project' | 'global'>,
        topK: number = 10
    ): Promise<SharedMemory[]> {
        // Get query embedding
        const queryEmbedding = await this.embed(query);

        // Filter by scope
        const candidates = Array.from(this.memories.values()).filter((m) =>
            scopes.includes(m.scope)
        );

        // Calculate cosine similarity
        const scoredMemories = candidates.map((memory) => {
            const similarity = memory.embedding
                ? this.cosineSimilarity(queryEmbedding, memory.embedding)
                : 0;

            return {
                memory,
                score: similarity * memory.importance, // Weight by importance
            };
        });

        // Sort by score and take top K
        scoredMemories.sort((a, b) => b.score - a.score);
        const topMemories = scoredMemories.slice(0, topK).map((sm) => sm.memory);

        // Update access count
        for (const memory of topMemories) {
            memory.accessCount++;
        }

        console.log(`[SharedMemory] Agent ${agentId} queried memories, found ${topMemories.length} results`);

        return topMemories;
    }

    /**
     * Delete a memory
     */
    async deleteMemory(memoryId: string): Promise<void> {
        this.memories.delete(memoryId);
    }

    /**
     * Get memory by ID
     */
    async getMemory(memoryId: string): Promise<SharedMemory | null> {
        return this.memories.get(memoryId) || null;
    }

    /**
     * Get all memories for an agent
     */
    async getAgentMemories(agentId: string): Promise<SharedMemory[]> {
        return Array.from(this.memories.values()).filter((m) => m.agentId === agentId);
    }

    /**
     * Cleanup old or low-access memories (garbage collection)
     */
    async cleanupMemories(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
        const now = Date.now();
        let removed = 0;

        for (const [id, memory] of this.memories.entries()) {
            const age = now - memory.timestamp.getTime();

            // Remove if:
            // 1. Too old AND low access count
            // 2. Very low importance AND no access
            if (
                (age > maxAge && memory.accessCount < 5) ||
                (memory.importance < 0.3 && memory.accessCount === 0)
            ) {
                this.memories.delete(id);
                removed++;
            }
        }

        console.log(`[SharedMemory] Cleaned up ${removed} old memories`);
        return removed;
    }

    /**
     * Generate embedding for text
     */
    private async embed(text: string): Promise<number[]> {
        // Check cache
        if (this.embeddingCache.has(text)) {
            return this.embeddingCache.get(text)!;
        }

        try {
            // Use OpenAI embeddings
            const response = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text,
            });

            const embedding = response.data[0].embedding;

            // Cache for reuse
            this.embeddingCache.set(text, embedding);

            return embedding;
        } catch (error) {
            console.error('[SharedMemory] Failed to generate embedding:', error);
            // Return zero vector on error
            return new Array(1536).fill(0);
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        normA = Math.sqrt(normA);
        normB = Math.sqrt(normB);

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (normA * normB);
    }

    /**
     * Get memory statistics
     */
    getStats(): {
        totalMemories: number;
        byType: Record<string, number>;
        byScope: Record<string, number>;
        totalAccesses: number;
    } {
        const memories = Array.from(this.memories.values());

        return {
            totalMemories: memories.length,
            byType: {
                fact: memories.filter((m) => m.type === 'fact').length,
                experience: memories.filter((m) => m.type === 'experience').length,
                pattern: memories.filter((m) => m.type === 'pattern').length,
            },
            byScope: {
                workspace: memories.filter((m) => m.scope === 'workspace').length,
                project: memories.filter((m) => m.scope === 'project').length,
                global: memories.filter((m) => m.scope === 'global').length,
            },
            totalAccesses: memories.reduce((sum, m) => sum + m.accessCount, 0),
        };
    }
}

export const sharedMemoryService = new SharedMemoryService();
