import { Inngest } from 'inngest';

// Initialize Inngest client
export const inngest = new Inngest({
  id: 'xovira-agents',
  name: 'Xovira AI Agents',
});

// Event types for agent execution
export type AgentExecuteEvent = {
  name: 'agent/execute';
  data: {
    executionId: string;
    agentId: string;
    userId: string;
    inputData?: any;
    executionContext?: any;
  };
};

export type AgentScheduledEvent = {
  name: 'agent/scheduled';
  data: {
    agentId: string;
    schedule: string;
  };
};

