import { SessionNotFoundError } from './sessionStorageError';
import { ModelManager } from './aiModelManager';
import { PlanManager } from '../billing';
import { Prisma, Service, SubscriptionPlan, SubscriptionStatus, Session } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DateTime } from 'luxon';

export class AuthManager {

  private static readonly TRANSACTION_TIMEOUT = 20000;
  private static readonly MAX_WAIT = 5000;

  static async findUserByUserId(userId: string) {
    return prisma.user.findUnique({
      where: { 
        id: userId 
      },
      include: {
        sessions: true,
        usages: true,
        contents: true,
        subscriptions: {
          include: {
            payments: true,
            plan: {
              include: {
                features: true
              }
            }
          }
        }
      }
    });
  }

  static async deleteSessions(userId: string, options?: { 
    exceptSessionToken?: string 
  }) {
    try {
      const deleteQuery: Prisma.SessionDeleteManyArgs = {
        where: { 
          userId: userId 
        }
      };
      if (options?.exceptSessionToken) {
        deleteQuery.where.NOT = {
          sessionToken: options.exceptSessionToken
        };
      }
      return await prisma.session.deleteMany(deleteQuery);
    } catch (error) {
      console.error('Error deleting user sessions:', error);
      throw error;
    }
  }

  static async findSubscriptionByUserId(userId: string) {
    return prisma.subscription.findUnique({
      where: {
        userId: userId
      },
      include: {
        plan: {
          include: {
            features: true
          }
        },
        payments: true,
      }
    });
  }

  static async findSessionsByUser(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: { userId: userId }, 
    });
  }

  static async findSessionBySessionToken(sessionToken: string): Promise<Session | null> {
    try {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
      });
      return session;
    } catch (error) {
      console.error('Error finding session by sessionToken:', error);
      throw new Error('Unable to retrieve session. Please try again later.');
    }
  }
  
  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email: email
      },
      include: {
        sessions: true,
        usages: true,
        contents: true,
        subscriptions: {
          include: {
            payments: true,
            plan: {
              include: {
                features: true
              }
            }
          }
        }
      }
    });
  }

  static async userExists(identifier: { id?: string; email?: string }) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: identifier.id },
            { email: identifier.email }
          ].filter(Boolean) 
        }
      });
      return !!user;
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  static async createUser(data: Prisma.UserCreateInput) {
    try {
      const exists = await this.userExists({ email: data.email });
      if (exists) {
        throw new Error('User already exists with this email');
      }
      return await prisma.user.create({
        data,
        include: {
          accounts: true,
          sessions: true,
          subscriptions: {
            include: {
              plan: true,
              payments: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findUserByResetToken(hashedToken: string) {
    try {
      return await prisma.user.findFirst({
        where: {
          resetToken: hashedToken,
          resetTokenExpiry: {
            gt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw error;
    }
  }

  static async updateUser(userIdOrEmail: string, data: Prisma.UserUpdateInput) {
    try {
      const where = userIdOrEmail.includes('@') 
        ? { email: userIdOrEmail }
        : { id: userIdOrEmail };

      const exists = await this.userExists(where);
      if (!exists) {
        throw new Error('User not found');
      }

      if (data.email) {
        const emailExists = await this.userExists({ 
          email: data.email as string,
          NOT: where
        });
        if (emailExists) {
          throw new Error('Email already in use');
        }
      }

      return await prisma.user.update({
        where,
        data,
        include: {
          accounts: true,
          sessions: true,
          subscriptions: {
            include: {
              plan: true,
              payments: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  static async upsertUser(
    where: Prisma.UserWhereUniqueInput,
    create: Prisma.UserCreateInput,
    update: Prisma.UserUpdateInput
  ) {
    try {
      return await prisma.user.upsert({
        where,
        create,
        update,
        include: {
          accounts: true,
          sessions: true,
          subscriptions: {
            include: {
              plan: true,
              payments: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    try {
      const exists = await this.userExists({ id: userId });
      if (!exists) {
        throw new Error('User not found');
      }

      return await prisma.user.delete({
        where: { id: userId }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async linkAccount(data: Prisma.AccountCreateInput) {
    try {
      const exists = await this.userExists({ id: data.userId });
      if (!exists) {
        throw new Error('User not found');
      }
      return await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: data.provider,
            providerAccountId: data.providerAccountId
          }
        },
        create: data,
        update: data
      });
    } catch (error) {
      console.error('Error linking account:', error);
      throw error;
    }
  }

  static async createSession(data: Prisma.SessionCreateInput) {
    try {
      const exists = await this.userExists({ id: data.userId });
      if (!exists) {
        throw new Error('User not found');
      }
      return await prisma.session.upsert({
        where: {
          sessionToken: data.sessionToken
        },
        create: data,
        update: {
          ...data,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error creating/updating session:', error);
      throw error;
    }
  }

  static async cleanupExpiredSessions() {
    try {
      return await prisma.session.deleteMany({
        where: {
          expires: {
            lt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  static async getActiveSessions(userId: string) {
    try {
      const exists = await this.userExists({ id: userId });
      if (!exists) {
        throw new Error('User not found');
      }

      return await prisma.session.findMany({
        where: {
          userId,
          expires: {
            gt: new Date()
          }
        },
        orderBy: {
          lastActive: 'desc'
        }
      });
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  }

  static async revokeOtherSessions(userId: string, currentSessionToken: string) {
    try {
      const exists = await this.userExists({ id: userId });
      if (!exists) {
        throw new Error('User not found');
      }

      return await prisma.session.deleteMany({
        where: {
          userId,
          NOT: {
            sessionToken: currentSessionToken
          }
        }
      });
    } catch (error) {
      console.error('Error revoking other sessions:', error);
      throw error;
    }
  }

  static async updateSessionActivity(sessionToken: string) {
    try {
      return await prisma.session.update({
        where: { sessionToken },
        data: {
          lastActive: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating session activity:', error);
      throw error;
    }
  }

  static async linkAccount(data: Prisma.AccountCreateInput) {
    try {
      return await prisma.account.create({
        data
      });
    } catch (error) {
      console.error('Error linking account:', error);
      throw error;
    }
  }

  static async unlinkAccount(providerId: string, providerAccountId: string) {
    try {
      return await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            provider: providerId,
            providerAccountId: providerAccountId
          }
        }
      });
    } catch (error) {
      console.error('Error unlinking account:', error);
      throw error;
    }
  }

  static async createAccount(data: Prisma.AccountCreateInput) {
    try {
      const existingAccount = await prisma.account.findFirst({
        where: {
          provider: data.provider,
          providerAccountId: data.providerAccountId
        }
      });

      if (existingAccount) {
        return existingAccount;
      }

      return await prisma.account.create({
        data,
        include: {
          user: true
        }
      });
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  static async verifySession(sessionToken: string) {
    try {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: {
          user: {
            include: {
              subscriptions: {
                include: {
                  plan: true
                }
              }
            }
          }
        }
      });

      if (!session || session.expires < new Date()) {
        throw new SessionNotFoundError('Invalid or expired session');
      }

      return session;
    } catch (error) {
      console.error('Error verifying session:', error);
      throw error;
    }
  }

  static async refreshSession(sessionToken: string, expiryDate: Date) {
    try {
      return await prisma.session.update({
        where: { sessionToken },
        data: {
          expires: expiryDate,
          lastActive: new Date()
        }
      });
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
  }

  static async hasLinkedProvider(userId: string, provider: string) {
    try {
      const account = await prisma.account.findFirst({
        where: {
          userId,
          provider
        }
      });
      return !!account;
    } catch (error) {
      console.error('Error checking linked provider:', error);
      throw error;
    }
  }

  static async linkAccountByEmail(userId: string, providerData: Prisma.AccountCreateInput) {
    try {
      const user = await this.findUserByUserId(userId);
      if (!user) {
        throw new Error('User not found');
      }
      const existingAccount = await prisma.account.findFirst({
        where: {
          provider: providerData.provider,
          providerAccountId: providerData.providerAccountId
        }
      });
      if (existingAccount) {
        if (existingAccount.userId !== userId) {
          return await prisma.account.update({
            where: {
              id: existingAccount.id
            },
            data: {
              userId,
              ...providerData
            }
          });
        }
        return existingAccount;
      }
      return await prisma.account.create({
        data: {
          ...providerData,
          userId
        }
      });
    } catch (error) {
      console.error('Error linking account by email:', error);
      throw error;
    }
  }

  static async unlinkAccountAndTransfer(
    fromUserId: string,
    toUserId: string,
    provider: string
  ) {
    try {
      const account = await prisma.account.findFirst({
        where: {
          userId: fromUserId,
          provider
        }
      });
      if (!account) {
        throw new Error('Account not found');
      }
      return await prisma.account.update({
        where: {
          id: account.id
        },
        data: {
          userId: toUserId
        }
      });
    } catch (error) {
      console.error('Error transferring account:', error);
      throw error;
    }
  }

  static async validateUserCredentials(email: string, password: string) {
    try {
      const user = await this.findUserByEmail(email);
      if (!user || !user.password) {
        return null;
      }
      const isValid = await bcrypt.compare(password, user.password);
      return isValid ? user : null;
    } catch (error) {
      console.error('Error validating credentials:', error);
      throw error;
    }
  }

  static async updateUserSession(userId: string, sessionData: Partial<Session>) {
    try {
      return await prisma.session.updateMany({
        where: { userId },
        data: {
          ...sessionData,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating user session:', error);
      throw error;
    }
  }
}