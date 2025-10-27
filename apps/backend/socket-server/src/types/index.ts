export * from '@xovira/types/socket-events';
export type TypingData = { postId?: string; commentId?: string };
export type SubscribeFeedData = { feedType: 'global' | 'user' | 'project' | 'team' | 'proposal'; feedId?: string };
export type UnsubscribeFeedData = SubscribeFeedData;