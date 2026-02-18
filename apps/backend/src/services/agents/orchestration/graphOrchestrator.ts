import { ConversationStage, AgentDraft } from '../state/agentBuilderStateService';
import { ExtractedConfiguration } from '../validation/configurationValidator';
import { openai } from '@/lib/openai';
import { fetchModel } from '@/utils/ai/fetchModel'; // Assuming this exists or similar util
import { GraphNodeId, GRAPH_NODES, ALLOWED_TRANSITIONS } from './builderGraph';

import { IStageOrchestrator, StageReadinessAssessment } from '../di/interfaces';

export class GraphOrchestrator implements IStageOrchestrator {

    constructor() { }

    /**
     * Maps Graph Nodes to Legacy Stages for backward compatibility
     */
    private mapNodeToStage(node: GraphNodeId): ConversationStage {
        switch (node) {
            case 'INTENT':
            case 'SCOPE':
            case 'BEHAVIOR':
            case 'TEAM':
            case 'CAPABILITIES':
            case 'TRIGGERS':
                return 'configuration';
            case 'VERIFICATION':
            case 'REFLECTION':
            case 'APPROVAL':
                return 'finalization';
            case 'LAUNCH':
                return 'launch';
            default:
                return 'configuration';
        }
    }

    /**
     * Determine the next node in the graph based on context
     */
    async determineNextNode(
        currentNode: GraphNodeId,
        draft: AgentDraft,
        history: Array<{ role: string; content: string }>,
        lastUserMessage: string
    ): Promise<{ nextNode: GraphNodeId; reasoning: string }> {

        // Dynamic Prompt to decide traversal
        const possibleTransitions = ALLOWED_TRANSITIONS.filter(t => t.from === currentNode);
        const targetNodes = possibleTransitions.map(t => t.to);

        const systemPrompt = `You are the Orchestration Engine for an AI Agent Builder.
Current Node: ${currentNode} (${GRAPH_NODES[currentNode].description})
Current Draft Status:
- Name: ${draft.name || 'Missing'}
- Tools: ${draft.tools?.length || 0}
- Triggers: ${draft.triggers?.length || 0}

[REFLECTION MODE]
If Current Node is REFLECTION:
- Critically evaluate the draft for missing edge cases.
- If issues found -> JUMP back to BEHAVIOR or TRIGGERS.
- If solid -> MOVE to APPROVAL.

Possible Next Nodes:
${targetNodes.map(n => `- ${n}: ${GRAPH_NODES[n].description}`).join('\n')}

Analyze the user's latest message and the draft state.
Decide:
1. STAY: If more info is needed for current node features.
2. MOVE: If the user is satisfied or asking about the next topic.
3. JUMP: If the user explicitly wants to go to a specific section (e.g. "Let's change the tools").

Return JSON: { "node": "GraphNodeId", "reason": "string" }
`;

        try {
            const model = await fetchModel(); // Using internal util
            const completion = await openai.chat.completions.create({
                model: model.name,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: lastUserMessage }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1
            });

            const response = JSON.parse(completion.choices[0].message.content || '{}');
            const nextNode = response.node as GraphNodeId;

            // Basic validation
            if (Object.keys(GRAPH_NODES).includes(nextNode)) {
                return { nextNode, reasoning: response.reason };
            }

            return { nextNode: currentNode, reasoning: "Invalid node returned, staying." };

        } catch (error) {
            console.error("Orchestration Error:", error);
            return { nextNode: currentNode, reasoning: "Error in orchestration, staying." };
        }
    }

    // --- Implementation of IStageOrchestrator Interface ---

    /**
     * Legacy adapter method to satisfy the interface.
     * Internally uses Graph Logic but returns strict Stages.
     */
    async determineStageProgression(
        currentStage: ConversationStage,
        draft: AgentDraft,
        conversationHistory: Array<{ role: string; content: string }>,
        userMessage: string,
        extractedConfig: ExtractedConfiguration,
        userId: string
    ): Promise<{ nextStage: ConversationStage; reasoning: string }> {

        // Heuristic: Infer current Graph Node from Stage + Draft State
        // (This is imperfect without persisting the Graph Node in DB, which is a larger refactor)
        let currentNode: GraphNodeId = 'INTENT';
        if (currentStage === 'configuration') {
            if (!draft.name) currentNode = 'SCOPE';
            else if (!draft.systemPrompt) currentNode = 'BEHAVIOR';
            else if (!draft.tools?.length) currentNode = 'CAPABILITIES';
            else currentNode = 'TRIGGERS';
        } else if (currentStage === 'finalization') {
            // Heuristic: If we just entered finalization, verify/reflect first
            // In a real DB-backed graph, this would be explicit state
            currentNode = 'REFLECTION';
        }

        const decision = await this.determineNextNode(currentNode, draft, conversationHistory, userMessage);

        return {
            nextStage: this.mapNodeToStage(decision.nextNode),
            reasoning: `[Graph: ${currentNode}->${decision.nextNode}] ${decision.reasoning}`
        };
    }

    async assessStageReadiness(
        targetStage: ConversationStage,
        draft: AgentDraft,
        userId: string
    ): Promise<StageReadinessAssessment> {
        // Basic implementation for compatibility
        const isReady = !!(draft.name && draft.systemPrompt);
        return {
            isReady,
            missingFields: isReady ? [] : ['name/systemPrompt'],
            completionPercentage: isReady ? 100 : 50,
            criticalIssues: [],
            recommendations: [],
            canProceed: true,
            userFriendlyMessage: isReady ? "Ready to launch!" : "Needs more info."
        };
    }
}
