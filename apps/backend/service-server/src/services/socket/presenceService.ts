import { redis } from '@/lib/redis';

export class PresenceService {
  private static PRESENCE_TTL = 300; // 5 minutes
  private static PRESENCE_KEY_PREFIX = 'presence:user:';
  private static SOCKET_SET_PREFIX = 'presence:sockets:'; // Track all sockets per user

  /**
   * Set user online with a specific socket
   * Supports multiple concurrent connections
   */
  static async setUserOnline(userId: string, socketId: string) {
    const userKey = `${this.PRESENCE_KEY_PREFIX}${userId}`;
    const socketSetKey = `${this.SOCKET_SET_PREFIX}${userId}`;
    const data = {
      userId,
      socketId,
      timestamp: Date.now(),
      status: 'online',
    };

    if (redis.status !== 'ready') {
      console.warn(`⚠️ User ${userId}: Redis is not READY (Status: ${redis.status}). Aborting presence update.`);
      return;
    }
    // Use pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Store presence data
    pipeline.setex(userKey, this.PRESENCE_TTL, JSON.stringify(data));
    
    // Track this socket for the user
    pipeline.sadd(socketSetKey, socketId);
    pipeline.expire(socketSetKey, this.PRESENCE_TTL);
    
    // Add to online users set
    pipeline.sadd('online_users', userId);
    try {
      const results = await pipeline.exec();
  
      // Log the success and the results of the pipeline commands
      console.log(`✅ Success: User ${userId} set to online. Pipeline results:`, results);
  
    } catch (error) {
      // Log the failure if the Redis connection or command execution fails
      console.error(`❌ Failure: Could not set user ${userId} online. Error:`, error);
    }
  }

  /**
   * Remove a specific socket connection
   * Only marks user offline if they have no remaining connections
   */
  static async setUserOffline(userId: string, socketId?: string) {
    const userKey = `${this.PRESENCE_KEY_PREFIX}${userId}`;
    const socketSetKey = `${this.SOCKET_SET_PREFIX}${userId}`;

    if (socketId) {
      // Remove this specific socket
      await redis.srem(socketSetKey, socketId);
      
      // Check if user has any remaining connections
      const remainingSockets = await redis.scard(socketSetKey);
      
      if (remainingSockets > 0) {
        // User still has other active connections
        return;
      }
    }

    // No more connections - mark user as offline
    const pipeline = redis.pipeline();
    pipeline.del(userKey);
    pipeline.del(socketSetKey);
    pipeline.srem('online_users', userId);
    await pipeline.exec();
  }

  /**
   * Check if user is online
   */
  static async isUserOnline(userId: string): Promise<boolean> {
    const key = `${this.PRESENCE_KEY_PREFIX}${userId}`;
    const exists = await redis.exists(key);
    return exists === 1;
  }

  /**
   * Get list of online users
   * Automatically cleans up stale entries
   */
  static async getOnlineUsers(): Promise<string[]> {
    const userIds = await redis.smembers('online_users');
    
    // Validate and clean up stale entries
    const validUsers: string[] = [];
    const staleUsers: string[] = [];

    for (const userId of userIds) {
      const isOnline = await this.isUserOnline(userId);
      if (isOnline) {
        validUsers.push(userId);
      } else {
        staleUsers.push(userId);
      }
    }

    // Clean up stale entries in background
    if (staleUsers.length > 0) {
      redis.srem('online_users', ...staleUsers).catch(err => 
        console.error('Error cleaning stale users:', err)
      );
    }

    return validUsers;
  }

  /**
   * Get count of online users (approximate)
   */
  static async getOnlineUserCount(): Promise<number> {
    return redis.scard('online_users');
  }

  /**
   * Get accurate count by validating entries
   */
  static async getAccurateOnlineUserCount(): Promise<number> {
    const users = await this.getOnlineUsers();
    return users.length;
  }

  /**
   * Update presence timestamp (heartbeat)
   */
  static async updatePresence(userId: string) {
    const userKey = `${this.PRESENCE_KEY_PREFIX}${userId}`;
    const socketSetKey = `${this.SOCKET_SET_PREFIX}${userId}`;
    
    const exists = await redis.exists(userKey);
    
    if (exists) {
      const pipeline = redis.pipeline();
      pipeline.expire(userKey, this.PRESENCE_TTL);
      pipeline.expire(socketSetKey, this.PRESENCE_TTL);
      await pipeline.exec();
    }
  }

  /**
   * Get user's active socket IDs
   */
  static async getUserSockets(userId: string): Promise<string[]> {
    const socketSetKey = `${this.SOCKET_SET_PREFIX}${userId}`;
    return redis.smembers(socketSetKey);
  }

  /**
   * Cleanup stale entries (run periodically via cron/background job)
   */
  static async cleanupStaleEntries(): Promise<number> {
    const allUsers = await redis.smembers('online_users');
    const staleUsers: string[] = [];

    for (const userId of allUsers) {
      const isOnline = await this.isUserOnline(userId);
      if (!isOnline) {
        staleUsers.push(userId);
      }
    }

    if (staleUsers.length > 0) {
      await redis.srem('online_users', ...staleUsers);
      console.log(`🧹 Cleaned up ${staleUsers.length} stale presence entries`);
    }

    return staleUsers.length;
  }
}