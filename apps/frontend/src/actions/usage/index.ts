'use server';

import { UsageManager } from '@/utils/usage';
import { SessionManager } from '@/utils/storage';
import { SubscriptionManager } from '@/utils/billing';

export async function updateUsageAction(
  userId: string,
  modelName: ModelName,
  inputTokens: number,
  outputTokens: number,
) {
  return UsageManager.updateUsage(userId, modelName, inputTokens, outputTokens);
}

export async function resetUsageCountsAction(
  userId: string,
) {
  return UsageManager.resetUsageCounts(userId);
}

export async function getUsageStateAction(userId: string) {
  return UsageManager.getUsageState(userId);
}

export async function getSubscriptionDetailsAction(userId: string) {
  return SubscriptionManager.getSubscriptionDetails(userId);
}

export async function handleCycleTransitionAction(userId: string) {
  return SubscriptionManager.handleCycleTransition(userId);
}

export async function checkAndManageCycleAction(userId: string) {
  return SubscriptionManager.checkAndManageCycle(userId);
}

export async function findUserByIdAction(userId: string) {
  return SessionManager.findUserByUserId(userId);
}






