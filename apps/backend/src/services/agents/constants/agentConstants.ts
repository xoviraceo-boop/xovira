
export const AGENT_CONSTANTS = {
    // System Limits
    LOCK_TIMEOUT: 60, // seconds
    RATE_LIMIT_MAX_REQUESTS: 20,
    RATE_LIMIT_WINDOW: 60, // seconds
    TOKEN_BUFFER: 500,

    // Error Codes
    ERRORS: {
        INSUFFICIENT_TOKENS: 'AGENT_INSUFFICIENT_TOKENS',
        CONVERSATION_LOCKED: 'AGENT_CONVERSATION_LOCKED',
        CONVERSATION_NOT_FOUND: 'AGENT_CONVERSATION_NOT_FOUND',
        UNAUTHORIZED: 'AGENT_UNAUTHORIZED',
        STATE_REFRESH_FAILED: 'AGENT_STATE_REFRESH_FAILED',
        COMPLETION_FAILED: 'LLM_COMPLETION_FAILED',
        INVALID_INPUT: 'INVALID_INPUT',
        RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    },

    // Intents
    INTENT: {
        BUILDER: {
            BUILD_OR_MODIFY: 'BUILD_OR_MODIFY',
            EXECUTE_ACTION: 'EXECUTE_ACTION',
            INFO_OR_QA: 'INFO_OR_QA',
        },
        OPERATOR: {
            UPDATE_CONFIG: 'UPDATE_CONFIG',
            EXECUTE_REQUEST: 'EXECUTE_REQUEST',
            GENERAL_QUERY: 'GENERAL_QUERY',
        },
        EXECUTOR: {
            EXECUTE: 'EXECUTE',
            CLARIFICATION: 'CLARIFICATION',
            IRRELEVANT: 'IRRELEVANT',
        },
    },

    // Prompts & Guardrails
    PROMPTS: {
        QUALITY_GUARDRAILS: `
QUALITY GUARDRAILS (MANDATORY)
- Be concise, factual, and action-oriented; avoid fluff.
- Reflect awareness of system state: stage, readiness, triggers, automation inference, token budget.
- Do not invent tools, triggers, automations, or data not present in context.
- Keep follow-up options <= 6, each < 150 chars, distinct and non-overlapping.
- ONLY provide follow-ups if they drive the conversation forward or offer valuable shortcuts.
- If the step is complete or a simple acknowledgement is needed, follow-ups can be empty.
- Ensure safety/policy alignment; refuse out-of-scope asks clearly.
- Provide minimal rationale inline only if helpful; avoid long monologues.
`,
        WRONG_CONTEXT_EXECUTION: `
You are the Agent {ROLE}. The user is asking to EXECUTE an action ("{MESSAGE}"), but this is the {VIEW_NAME} view, meant for {PURPOSE}.
You CANNOT execute actions here.
Instruct the user strictly to:
1. Go to the "Run" tab or "Executor" view.
2. Or mention the agent in a task/DM.
3. Or stick to {ALLOWED_ACTIONS} here.
Be helpful but firm on the boundary.
`,
    },
};
