import { AGENT_CONSTANTS } from '../constants/agentConstants';

import { fetchModel } from '@/utils/ai/fetchModel';
import { openai } from '@/lib/openai';
import { extractJson } from '@/utils/ai/jsonParsing';

export interface IntentInferenceResult {
    intent: string;
    confidence: number;
    reason: string;
}

export class IntentInferenceService {
    /**
     * Infers the user's intent within the Builder context.
     * Distinguishes between building/modifying, executing actions, and info/QA.
     */
    async inferBuilderIntent(
        message: string,
        history: any[]
    ): Promise<IntentInferenceResult> {
        const recentHistory = history.slice(-5).map((h: any) => `${h.role}: ${h.content}`).join('\n');
        const model = await fetchModel();

        const systemPrompt = `You are an Intent Classifier for an AI Agent Builder.
Your goal is to classify the user's latest message into one of three categories:

1. ${AGENT_CONSTANTS.INTENT.BUILDER.BUILD_OR_MODIFY}: The user wants to change configuration, add capabilities, set triggers, or refine the agent. (e.g., "Add a Jira tool", "Change the name", "Make it friendlier")
2. ${AGENT_CONSTANTS.INTENT.BUILDER.EXECUTE_ACTION}: The user is trying to RUN or EXECUTE a task that the agent would perform. (e.g., "Analyze this file", "Create a ticket", "Run the report") - THIS IS WRONG CONTEXT for Builder.
3. ${AGENT_CONSTANTS.INTENT.BUILDER.INFO_OR_QA}: The user is asking questions about the agent or the building process.

Output JSON: { "intent": string, "confidence": number, "reason": string }`;

        const response = await openai.chat.completions.create({
            model: model.name,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `History:\n${recentHistory}\n\nUser Message: ${message}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0,
        });

        const content = response.choices[0].message.content;
        try {
            return extractJson(content || '{}');
        } catch (e) {
            return { intent: AGENT_CONSTANTS.INTENT.BUILDER.INFO_OR_QA, confidence: 0, reason: 'Failed to parse intent' };
        }
    }

    /**
     * Infers the user's intent within the Operator context.
     * Similar to Builder but focused on Operator capabilities.
     */
    async inferOperatorIntent(
        message: string,
        history: any[]
    ): Promise<IntentInferenceResult> {
        const recentHistory = history.slice(-5).map((h: any) => `${h.role}: ${h.content}`).join('\n');
        const model = await fetchModel();

        const systemPrompt = `You are an Intent Classifier for an AI Agent Operator.
Your goal is to classify the user's latest message:

1. ${AGENT_CONSTANTS.INTENT.OPERATOR.UPDATE_CONFIG}: User wants to update/patch the agent's config. (e.g., "Change the prompt", "Add tool")
2. ${AGENT_CONSTANTS.INTENT.OPERATOR.EXECUTE_REQUEST}: User wants to RUN the agent. (e.g., "Run now", "Do the task") - Operator can trigger dry runs, but primary execution is Executor.
3. ${AGENT_CONSTANTS.INTENT.OPERATOR.GENERAL_QUERY}: Questions about the agent.

Output JSON: { "intent": string, "confidence": number, "reason": string }`;

        const response = await openai.chat.completions.create({
            model: model.name,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `History:\n${recentHistory}\n\nUser Message: ${message}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0,
        });

        const content = response.choices[0].message.content;
        try {
            return extractJson(content || '{}');
        } catch (e) {
            return { intent: AGENT_CONSTANTS.INTENT.OPERATOR.GENERAL_QUERY, confidence: 0, reason: 'Failed to parse intent' };
        }
    }

    /**
     * Infers the user's intent within the Executor context.
     */
    async inferExecutorIntent(
        message: string,
        history: any[]
    ): Promise<IntentInferenceResult> {
        const recentHistory = history.slice(-5).map((h: any) => `${h.role}: ${h.content}`).join('\n');
        const model = await fetchModel();

        const systemPrompt = `You are an Intent Classifier for an AI Agent Executor.
Your goal is to classify the user's latest message:

1. ${AGENT_CONSTANTS.INTENT.EXECUTOR.EXECUTE}: The user wants to run the agent or provide input for execution.
2. ${AGENT_CONSTANTS.INTENT.EXECUTOR.CLARIFICATION}: The user is providing specific details for a run or answering a question.
3. ${AGENT_CONSTANTS.INTENT.EXECUTOR.IRRELEVANT}: The user is asking to MODIFY the agent (e.g., "Change your prompt"), which is NOT allowed here.

Output JSON: { "intent": string, "confidence": number, "reason": string }`;

        const response = await openai.chat.completions.create({
            model: model.name,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `History:\n${recentHistory}\n\nUser Message: ${message}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0,
        });

        const content = response.choices[0].message.content;
        try {
            return extractJson(content || '{}');
        } catch (e) {
            return { intent: AGENT_CONSTANTS.INTENT.EXECUTOR.CLARIFICATION, confidence: 0, reason: 'Failed to parse intent' };
        }
    }
}

export const intentInferenceService = new IntentInferenceService();
