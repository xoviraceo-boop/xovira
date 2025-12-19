import { Pool } from 'pg';
import env from '@/config/env';
import { ProjectMatcher } from './matchers/project';
import { ProposalMatcher } from './matchers/proposal';
import { MemberProfileMatcher } from './matchers/profile';
import { TeamMatcher } from './matchers/team';
import { MatchBatchProcessor } from './processors/batch';

// Export types
export * from './types';
export * from './config/shared';
export * from './config/queue';
export * from './config/worker';


// Create connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

// Singleton instances
let projectMatcherInstance: ProjectMatcher;
let proposalMatcherInstance: ProposalMatcher;
let memberProfileMatcherInstance: MemberProfileMatcher;
let teamMatcherInstance: TeamMatcher; // ADD THIS

/**
 * Get ProjectMatcher instance
 */
export function getProjectMatcher(): ProjectMatcher {
  if (!projectMatcherInstance) {
    projectMatcherInstance = new ProjectMatcher(pool);
  }
  return projectMatcherInstance;
}

/**
 * Get ProposalMatcher instance
 */
export function getProposalMatcher(): ProposalMatcher {
  if (!proposalMatcherInstance) {
    proposalMatcherInstance = new ProposalMatcher(pool);
  }
  return proposalMatcherInstance;
}

/**
 * Get MemberProfileMatcher instance
 */
export function getMemberProfileMatcher(): MemberProfileMatcher {
  if (!memberProfileMatcherInstance) {
    memberProfileMatcherInstance = new MemberProfileMatcher(pool);
  }
  return memberProfileMatcherInstance;
}

/**
 * Get TeamMatcher instance
 */
export function getTeamMatcher(): TeamMatcher {
  if (!teamMatcherInstance) {
    teamMatcherInstance = new TeamMatcher(pool);
  }
  return teamMatcherInstance;
}

/**
 * Process all matches (batch processing)
 */
export async function processAllMatches(options?: {
  threshold?: number;
  batchSize?: number;
  enableLogging?: boolean;
}) {
  const processor = new MatchBatchProcessor(pool, options);
  return processor.processAll();
}

// Convenience exports for direct matching functions

// Project matching
export const findMatchingProfilesForProjectHiring = (projectId: string, limit?: number) =>
  getProjectMatcher().findProfilesForHiring(projectId, limit);

export const findMatchingTeamsForProjectHiring = (projectId: string, limit?: number) =>
  getProjectMatcher().findTeamsForHiring(projectId, limit);

export const findMatchingProposalsForProjectHiring = (projectId: string, limit?: number) =>
  getProjectMatcher().findProposalsForHiring(projectId, limit);

// Proposal matching
export const findMatchingProjectsForProposal = (proposalId: string, limit?: number) =>
  getProposalMatcher().findProjects(proposalId, limit);

export const findMatchingTeamsForProposal = (proposalId: string, limit?: number) =>
  getProposalMatcher().findTeams(proposalId, limit);

export const findMatchingProfilesForProposal = (proposalId: string, limit?: number) =>
  getProposalMatcher().findProfiles(proposalId, limit);

// Member profile matching
export const findMatchingTeamsForMemberProfile = (userId: string, limit?: number) =>
  getMemberProfileMatcher().findTeams(userId, limit);

export const findMatchingProjectsForMemberProfile = (userId: string, limit?: number) =>
  getMemberProfileMatcher().findProjects(userId, limit);

// Team matching (NEW)
export const findMatchingProjectsForTeam = (teamId: string, limit?: number) =>
  getTeamMatcher().findProjects(teamId, limit);

export const findMatchingProposalsForTeam = (teamId: string, limit?: number) =>
  getTeamMatcher().findProposals(teamId, limit);

export const findMatchingProfilesForTeamHiring = (teamId: string, limit?: number) =>
  getTeamMatcher().findProfilesForHiring(teamId, limit);

export const findMatchingTeamsForCollaboration = (teamId: string, limit?: number) =>
  getTeamMatcher().findTeamsForCollaboration(teamId, limit);