/**
 * Agent Builder Prompt Service
 * 
 * Builds prompts for the Builder AI
 */

import { ConversationState } from '../state/agentBuilderStateService';
import { UserContext } from '../state/agentBuilderContextService';
import { AI_BUILDER_FLOW_GUIDE } from '../instructions/aiBuilderFlowGuide';
import { PromptTemplateService } from './promptTemplateService';
import { PromptExampleService } from './promptExampleService';

export class AgentBuilderPromptService {
  private templateService: PromptTemplateService;
  private exampleService: PromptExampleService;

  constructor() {
    this.templateService = new PromptTemplateService();
    this.exampleService = new PromptExampleService();
  }
  buildBuilderPrompt(
    conversationState: ConversationState,
    userContext: UserContext,
    userMessage: string
  ): string {
    const activeLists = this.getActiveListsSummary(userContext);
    const patterns = this.formatPatterns(
      userContext.recentActivity?.commonTaskPatterns || []
    );
    const mentionedLists =
      conversationState.focusedList?.name || 'none';
    const mentionedUsers =
      conversationState.mentionedUsers
        ?.map((u) => u.name)
        .join(', ') || 'none';
    const suggestions = conversationState.suggestions
      .map((s) => `- ${s.label}: ${s.reason}`)
      .join('\n');
    // Include more history for better context (will be used in full in LLM call)
    const recentHistory = conversationState.conversationHistory
      .slice(-10)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    // Build context sections
    const workspaceContext = this.buildWorkspaceContext(userContext);
    const spaceContext = this.buildSpaceContext(userContext);
    const projectContext = this.buildProjectContext(userContext);
    const teamContext = this.buildTeamContext(userContext);

    // Dynamic Few-Shot Examples (New)
    const examples = this.exampleService.getRelevantExamples(userMessage);
    const examplesContext = this.exampleService.formatExamples(examples);

    // Use Template Service to render the core system prompt
    // For now, we are keeping the logic inline for safety, but wrapping it
    // In a real deployment, we would load 'builder_system' from file.

    // Example of how usage would look:
    // return this.templateService.render(TEMPLATE_STRING, { ...variables });

    return `You are the Xovira Super Agent Builder AI. You help users create automation agents through natural conversation.

=== AI BUILDER FLOW GUIDE (REFERENCE) ===
${AI_BUILDER_FLOW_GUIDE}
=== END OF FLOW GUIDE ===

${examplesContext}

CURRENT CONVERSATION STAGE: ${conversationState.stage}
${conversationState.stageReasoning ? `STAGE CONTEXT/REASONING: ${conversationState.stageReasoning}` : ''}

USER CONTEXT:
${workspaceContext}
${spaceContext}
${projectContext}
${teamContext}
- Active Lists: ${activeLists}
- Recent Activity: ${userContext.recentActivity?.mostActiveList || 'No recent activity'} is most active
- Common Patterns: ${patterns}

AGENT BEING BUILT:
${JSON.stringify(conversationState.agentDraft, null, 2)}

DETECTED ENTITIES IN USER MESSAGE:
- Mentioned Lists: ${mentionedLists}
- Mentioned Users: ${mentionedUsers}

SUGGESTIONS AVAILABLE:
${suggestions || 'None'}

CONVERSATION HISTORY:
${recentHistory || 'No previous messages'}

USER'S LATEST MESSAGE:
"${userMessage}"

CRITICAL RULES:
1. ALL messages must be AI-generated (including welcome) - never use templates
2. Always provide numbered options (1, 2, 3, etc.) so users can respond with just numbers
3. Ask ONE question at a time (exception: related short questions can be grouped with numbers)
4. Generate follow-ups ONLY if they add value or drive the conversation. If not needed, return empty array.
5. Use user's actual workspace data, never generic examples
6. Maximum 7-10 numbered options per message
7. Follow-ups can be detailed (up to 150 chars). Ensure they are strictly related to the context.
8. Ensure high-quality configuration by asking deep, clarifying questions if necessary, even if it takes multiple turns.

FOLLOW-UP GENERATION:
After your response, generate follow-up options ONLY IF helpful.
- If the user's request is complete or a simple acknowledgement is needed, do NOT generate follow-ups.
- If generating follow-ups:
  - Make them concise but descriptive enough (max 150 chars)
  - Directly relate to the current question
  - Include "Custom" or "Other" option when appropriate
  - Use user's actual data when possible

Format follow-ups as JSON array in your response:
{
  "response": "Your message here",
  "followups": [
    { "id": "followup_1", "label": "Option 1 text" },
    { "id": "followup_2", "label": "Option 2 text" }
  ]
}

If you cannot generate JSON, include follow-ups at the end of your message marked with [FOLLOWUPS: ...]

NUMBERED LIST FORMAT:
- Always number options: 1, 2, 3, etc.
- Format: "1. Option text" or "**1.** Option text"
- Group related options together
- Maximum 7-10 numbered options per message
- Users can respond with: "1", "1, 3, 5", "all", "first two", etc.

CONVERSATION FLOW STAGES:
1. intent_understanding - Understand what type of agent they want (provide numbered automation types)
2. role_objective - Ask about the agent's role and objective (provide numbered role options)
3. scope_definition - Define scope (CRITICAL: User can choose ONE of: workspace, space, project, or team. Show all 4 types as numbered options first, then show specific items of the selected type)
4. capacities_configuration - Configure capabilities (provide numbered action options)
5. knowledge_configuration - Set up knowledge sources (provide numbered knowledge options)
6. tools_configuration - Configure tool parameters (provide numbered parameter combinations)
7. rules_configuration - Define rules and guardrails (provide numbered rule options)
8. trigger_configuration - Set up triggers (provide numbered trigger options)
9. testing - Test with scenarios (provide numbered test/feedback options)
10. review - Final review before launch (provide numbered launch options)
11. launch - Activate the agent (provide numbered post-launch options)

SCOPE SELECTION (stage 3 - scope_definition):
When asking about scope, FIRST present the 4 scope types as numbered options:
1. Workspace (entire workspace)
2. Space (specific space within a workspace)
3. Project (specific project)
4. Team (specific team)

After user selects a type, show numbered options for that type:
- If Workspace: Show available workspaces
- If Space: Show available spaces
- If Project: Show available projects
- If Team: Show available teams

User must select ONE scope type and ONE specific item within that type.

RESPONSE INSTRUCTIONS:
1. Generate a natural, conversational response based on the current stage
2. Include numbered options (1, 2, 3, etc.) for user to choose from
3. Reference user's actual workspace data (lists, projects, teams, members)
4. Acknowledge when user mentions workspace entities
5. Ask ONE clear question at a time. Prioritize clarifying scope and intent over rushing.
6. Generate follow-ups ONLY if they drive the conversation. If not needed, omit the "followups" field or return empty array.
7. Format response as JSON with "response" and optional "followups" fields
8. If JSON format fails, include follow-ups at end marked [FOLLOWUPS: ...]

Respond naturally to help the user progress through agent creation. Do not be afraid to ask for clarification.`;
  }

  buildWelcomePrompt(
    userContext: UserContext,
    userName?: string
  ): string {
    const workspace = userContext.workspace;
    const recentActivity = userContext.recentActivity;
    const teamMembers = userContext.teamMembers;

    const activeListsCount = workspace
      ? workspace.spaces.reduce(
        (sum, space) => sum + space.allLists.length,
        0
      )
      : 0;
    const mostActiveList = recentActivity?.mostActiveList;
    const projects = userContext.projects.map(p => p.name).join(', ') || 'None';
    const teams = userContext.teams.map(t => t.name).join(', ') || 'None';
    const workspaces = userContext.workspaces.map(w => w.name).join(', ') || 'None';
    const teamMembersList = teamMembers
      ? teamMembers.map(m => m.name).join(', ')
      : 'Not loaded yet';

    return `Generate a personalized welcome message for a user creating an AI agent.

=== AI BUILDER FLOW GUIDE (REFERENCE) ===
${AI_BUILDER_FLOW_GUIDE}
=== END OF FLOW GUIDE ===

User Context:
- Workspaces: ${workspaces}
${workspace ? `- Current Workspace: ${workspace.name}` : ''}
- Active Lists: ${activeListsCount}
- Most Active List: ${mostActiveList || 'None'}
- Projects: ${projects}
- Teams: ${teams}
${teamMembers ? `- Team Members: ${teamMembersList}` : ''}

Requirements (from flow guide):
1. Be conversational and friendly
2. Reference their workspace and recent activity
3. Include numbered options (1, 2, 3, etc.) for automation types
4. Generate 3-5 follow-up options
5. Keep follow-ups concise (max 10 words each)
6. ALL messages must be AI-generated - never use templates

Generate the welcome message with follow-ups.`;
  }

  buildWelcomeMessage(
    userContext: UserContext,
    userName?: string
  ): string {
    // Welcome message should be generated by AI, not predefined
    // This is a fallback - the AI should generate the actual welcome message
    const activeListsCount = userContext.workspace
      ? userContext.workspace.spaces.reduce(
        (sum, space) => sum + space.allLists.length,
        0
      )
      : 0;
    const mostActiveList = userContext.recentActivity?.mostActiveList;
    const workspaceName = userContext.workspace?.name || userContext.workspaces[0]?.name || 'your workspace';

    let message = `👋 Hi${userName ? ` ${userName}` : ''}! I'm the Super Agent Builder.\n\n`;
    message += `I can see you're working in ${workspaceName}`;
    if (activeListsCount > 0) {
      message += ` with ${activeListsCount} active list${activeListsCount !== 1 ? 's' : ''}`;
    }
    message += '.\n';

    if (mostActiveList) {
      message += `I notice ${mostActiveList} has been really busy lately!\n\n`;
    }

    message += `Let me help you create an automation agent. What would you like to automate?\n\n`;
    message += `1. Task automation (create, update, organize tasks automatically)\n`;
    message += `2. Notification automation (send alerts when events happen)\n`;
    message += `3. Report automation (generate and share reports on schedule)\n`;
    message += `4. Data processing automation (analyze and transform data)\n`;
    message += `5. Something else (describe in your own words)\n\n`;
    message += `Which one matches your needs? (Just reply with the number or describe it)`;

    return message;
  }

  private getActiveListsSummary(userContext: UserContext): string {
    if (!userContext.workspace) {
      return 'Workspace details not loaded yet';
    }
    const lists = userContext.workspace.spaces.flatMap((space) =>
      space.allLists.map((list) => list.name)
    );
    return lists.slice(0, 10).join(', ') + (lists.length > 10 ? '...' : '');
  }

  private buildWorkspaceContext(userContext: UserContext): string {
    if (userContext.workspace) {
      const spaces = userContext.workspace.spaces.map((s) => s.name).join(', ');
      const teamMembers = userContext.teamMembers
        ? userContext.teamMembers.map((m) => m.name).join(', ')
        : 'Not loaded';
      return `WORKSPACE CONTEXT:
- Workspace: ${userContext.workspace.name}
- Available Spaces: ${spaces || 'None'}
- Team Members: ${teamMembers}`;
    }
    const workspaces = userContext.workspaces.map((w) => w.name).join(', ');
    return `WORKSPACE CONTEXT:
- Available Workspaces: ${workspaces || 'None'}
- Note: Detailed workspace structure will be loaded when scope is confirmed`;
  }

  private buildProjectContext(userContext: UserContext): string {
    const projects = userContext.projects.map((p) => p.name).join(', ') || 'None';
    let context = `PROJECTS:
- Available Projects: ${projects}`;

    if (userContext.projectDetails) {
      const projectTeams = userContext.projectDetails.teams.map((t) => t.name).join(', ') || 'None';
      const projectMembers = userContext.projectDetails.members.map((m) => m.name).join(', ') || 'None';
      context += `
- Selected Project: ${userContext.projectDetails.project.name}
- Project Teams: ${projectTeams}
- Project Members: ${projectMembers}`;
    }

    return context;
  }

  private buildTeamContext(userContext: UserContext): string {
    const teams = userContext.teams.map((t) => t.name).join(', ') || 'None';
    let context = `TEAMS:
- Available Teams: ${teams}`;

    if (userContext.teamDetails) {
      const teamMembers = userContext.teamDetails.members.map((m) => m.name).join(', ') || 'None';
      context += `
- Selected Team: ${userContext.teamDetails.team.name}
- Team Members: ${teamMembers}`;
    }

    return context;
  }

  private buildSpaceContext(userContext: UserContext): string {
    const spaces = userContext.spaces.map((s) => s.name).join(', ') || 'None';
    let context = `SPACES:
- Available Spaces: ${spaces}`;

    if (userContext.spaceDetails) {
      const spaceLists = userContext.spaceDetails.lists.map((l) => l.name).join(', ') || 'None';
      const folderCount = userContext.spaceDetails.folders.length;
      context += `
- Selected Space: ${userContext.spaceDetails.space.name}
- Lists: ${spaceLists}
- Folders: ${folderCount} folder${folderCount !== 1 ? 's' : ''}`;
    }

    return context;
  }

  private formatPatterns(
    patterns: Array<{ type: string; description: string; confidence?: number }>
  ): string {
    if (patterns.length === 0) return 'No patterns detected yet';
    return patterns.map((p) => `- ${p.description}`).join('\n');
  }
}

export const agentBuilderPromptService = new AgentBuilderPromptService();
