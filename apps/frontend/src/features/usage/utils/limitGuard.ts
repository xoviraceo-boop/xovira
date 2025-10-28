import { prisma } from '@/lib/prisma';
import { SubscriptionManager } from '@/features/billing/utils/subscriptionManager';

type ServiceKey = 'PROJECT' | 'TEAM' | 'PROPOSAL' | 'REQUEST';

interface PlanLimits {
  maxProjects: number;
  maxTeams: number;
  maxProposals: number;
  maxRequests: number;
}

interface ResourceCounts {
  projectsOwned: number;
  teamsOwned: number;
  proposalsOwned: number;
  requestsSent: number;
}

export class LimitGuard {
  private constructor() {}

  static async ensureCycle(userId: string): Promise<void> {
    try {
      await SubscriptionManager.handleCycleTransition(userId);
    } catch (err) {
      // Non-blocking; log only
      console.warn('Cycle transition check failed:', err);
    }
  }

  static async getPlanLimits(userId: string): Promise<PlanLimits> {
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'ON_HOLD'] } },
      include: { plan: { include: { feature: true } } },
    });
    const f = sub?.plan?.feature;
    return {
      maxProjects: f?.maxProjects ?? 0,
      maxTeams: f?.maxTeams ?? 0,
      maxProposals: f?.maxProposals ?? 0,
      maxRequests: f?.maxRequests ?? 0,
    };
  }

  static async getResourceCounts(userId: string): Promise<ResourceCounts> {
    const [projectsOwned, teamsOwned, proposalsOwned, requestsSent] = await Promise.all([
      prisma.project.count({ where: { ownerId: userId } }),
      prisma.team.count({ where: { ownerId: userId } }),
      prisma.proposal.count({ where: { userId } }),
      prisma.request.count({ where: { senderId: userId } }),
    ]);
    return { projectsOwned, teamsOwned, proposalsOwned, requestsSent };
  }

  static async ensureWithinCreateLimit(userId: string, service: ServiceKey): Promise<void> {
    const limits = await this.getPlanLimits(userId);
    const counts = await this.getResourceCounts(userId);
    const over = (svc: ServiceKey): boolean => {
      switch (svc) {
        case 'PROJECT':
          return counts.projectsOwned >= limits.maxProjects;
        case 'TEAM':
          return counts.teamsOwned >= limits.maxTeams;
        case 'PROPOSAL':
          return counts.proposalsOwned >= limits.maxProposals;
        case 'REQUEST':
          return counts.requestsSent >= limits.maxRequests;
      }
    };
    if (over(service)) {
      throw new Error('You have reached your plan limit. Please upgrade to continue.');
    }
  }

  static async ensureCanModify(userId: string, service: ServiceKey): Promise<void> {
    const limits = await this.getPlanLimits(userId);
    const counts = await this.getResourceCounts(userId);
    const exceeds = (svc: ServiceKey): boolean => {
      switch (svc) {
        case 'PROJECT':
          return counts.projectsOwned > limits.maxProjects;
        case 'TEAM':
          return counts.teamsOwned > limits.maxTeams;
        case 'PROPOSAL':
          return counts.proposalsOwned > limits.maxProposals;
        case 'REQUEST':
          return counts.requestsSent > limits.maxRequests;
      }
    };
    if (exceeds(service)) {
      throw new Error('Your current plan allows fewer items. Editing/publishing is blocked until you reduce items or upgrade.');
    }
  }
}


