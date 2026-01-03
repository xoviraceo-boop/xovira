/**
 * Permission Service
 * 
 * Handles agent permission checks for read, write, and execute operations.
 */

import { prisma } from '@/lib/prisma';

export class PermissionService {
  /**
   * Check if user has permission to perform an action on an agent
   */
  async checkAgentPermission(
    agentId: string,
    userId: string,
    permission: 'read' | 'write' | 'execute'
  ): Promise<boolean> {
    try {
      const agent = await prisma.aiAgent.findUnique({
        where: { id: agentId },
        include: {
          collaborators: {
            where: { userId },
          },
        },
      });

      if (!agent) {
        return false;
      }

      // Creator has all permissions
      if (agent.createdBy === userId) {
        return true;
      }

      // Check collaborator permissions
      const collaborator = agent.collaborators[0];
      if (!collaborator) {
        return false;
      }

      switch (permission) {
        case 'read':
          return true; // All collaborators can read
        case 'write':
          return collaborator.canEdit || false;
        case 'execute':
          return collaborator.canExecute || false;
        default:
          return false;
      }
    } catch (error) {
      console.error('[PermissionService] Failed to check permission:', error);
      return false;
    }
  }

  /**
   * Check if user can read agent
   */
  async canRead(agentId: string, userId: string): Promise<boolean> {
    return this.checkAgentPermission(agentId, userId, 'read');
  }

  /**
   * Check if user can write/modify agent
   */
  async canWrite(agentId: string, userId: string): Promise<boolean> {
    return this.checkAgentPermission(agentId, userId, 'write');
  }

  /**
   * Check if user can execute agent
   */
  async canExecute(agentId: string, userId: string): Promise<boolean> {
    return this.checkAgentPermission(agentId, userId, 'execute');
  }
}

