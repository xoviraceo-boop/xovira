"use server";
import { prisma } from '@/lib/prisma'
import { SubscribeInput, OneTimePayment } from '@/features/billing/types';
import { PlanManager, SubscriptionManager, CreditManager } from '@/utils/billing';

export async function getSubscriptionPlans() {
  try {
    const plans = await PlanManager.getAllPlans();
    return plans;
  } catch (error) {
    console.error('Error registering product:', error);
    return null;
  }
}

export async function getPlanByName(planName: string) {
  try {
    const plan = await PlanManager.getPlanByName(planName);
    return plan;
  } catch (error) {
    console.error('Error registering product:', error);
    return null;
  }
}

export async function getAllStandardPackages() {
  try {
    const packages = await CreditManager.getAllStandardPackages();
    return packages;
  } catch (error) {
    console.error('Error registering product:', error);
    return null;
  }
}

export async function createStandardCreditPackages() {
  try {
    const packages = await CreditManager.createStandardCreditPackages();
    return packages;
  } catch (error) {
    console.error('Error registering product:', error);
    return null;
  }
}

export async function getSubscriptionDetails(userId: string) {
  try {
    const data = await SubscriptionManager.getSubscriptionDetails(userId);
    return data;
  } catch (error) {
    console.error('Error registering product:', error);
    return null;
  }
}

export async function subscribe(subscriptionData: SubscribeInput) {
  try {
    const data = await SubscriptionManager.active(subscriptionData);
    return data;
  } catch (error) {
    console.error('Error registering product:', error);
    return null;
  }
}

export async function purchase(paymentData: OneTimePayment) {
  try {
    const data = await CreditManager.purchaseCredits(paymentData);
    return data;
  } catch (error) {
    console.error('Error registering product:', error);
    return null;
  }
}

