/*
  Warnings:

  - You are about to drop the column `payment_id` on the `credit_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `BillingEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Discount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountToPackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountToPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DiscountToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Promotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromotionToPackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromotionToPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PromotionToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WebhookLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WebhookQueue` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `credit_packages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subscription_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[purchase_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `display_name` to the `credit_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `package_type` to the `credit_packages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE', 'CUSTOM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "PaymentStatus" ADD VALUE 'DENIED';

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'ON_HOLD';

-- DropForeignKey
ALTER TABLE "public"."BillingEvent" DROP CONSTRAINT "BillingEvent_creditPurchaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BillingEvent" DROP CONSTRAINT "BillingEvent_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BillingEvent" DROP CONSTRAINT "BillingEvent_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BillingEvent" DROP CONSTRAINT "BillingEvent_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountToPackage" DROP CONSTRAINT "DiscountToPackage_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountToPackage" DROP CONSTRAINT "DiscountToPackage_packageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountToPlan" DROP CONSTRAINT "DiscountToPlan_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountToPlan" DROP CONSTRAINT "DiscountToPlan_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountToUser" DROP CONSTRAINT "DiscountToUser_discountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DiscountToUser" DROP CONSTRAINT "DiscountToUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromotionToPackage" DROP CONSTRAINT "PromotionToPackage_packageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromotionToPackage" DROP CONSTRAINT "PromotionToPackage_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromotionToPlan" DROP CONSTRAINT "PromotionToPlan_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromotionToPlan" DROP CONSTRAINT "PromotionToPlan_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromotionToUser" DROP CONSTRAINT "PromotionToUser_promotionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PromotionToUser" DROP CONSTRAINT "PromotionToUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Usage" DROP CONSTRAINT "Usage_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."credit_purchases" DROP CONSTRAINT "credit_purchases_payment_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."credit_purchases" DROP CONSTRAINT "credit_purchases_usage_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payments_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_usage_id_fkey";

-- DropIndex
DROP INDEX "public"."credit_purchases_payment_id_key";

-- DropIndex
DROP INDEX "public"."payments_subscriptionId_idx";

-- AlterTable
ALTER TABLE "credit_packages" ADD COLUMN     "display_name" TEXT NOT NULL,
ADD COLUMN     "package_type" "PackageType" NOT NULL;

-- AlterTable
ALTER TABLE "credit_purchases" DROP COLUMN "payment_id";

-- AlterTable
ALTER TABLE "features" ADD COLUMN     "max_credits" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "subscriptionId",
ADD COLUMN     "chargeId" TEXT,
ADD COLUMN     "intentId" TEXT,
ADD COLUMN     "purchase_id" TEXT,
ADD COLUMN     "subscription_id" TEXT;

-- DropTable
DROP TABLE "public"."BillingEvent";

-- DropTable
DROP TABLE "public"."Discount";

-- DropTable
DROP TABLE "public"."DiscountToPackage";

-- DropTable
DROP TABLE "public"."DiscountToPlan";

-- DropTable
DROP TABLE "public"."DiscountToUser";

-- DropTable
DROP TABLE "public"."Promotion";

-- DropTable
DROP TABLE "public"."PromotionToPackage";

-- DropTable
DROP TABLE "public"."PromotionToPlan";

-- DropTable
DROP TABLE "public"."PromotionToUser";

-- DropTable
DROP TABLE "public"."Usage";

-- DropTable
DROP TABLE "public"."WebhookLog";

-- DropTable
DROP TABLE "public"."WebhookQueue";

-- DropEnum
DROP TYPE "public"."Package";

-- CreateTable
CREATE TABLE "billing_events" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "creditPurchaseId" TEXT,
    "type" "BillingEventType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "promotionId" TEXT,
    "discountId" TEXT,
    "status" "BillingEventStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAmount" DOUBLE PRECISION,
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" "PromotionUnit" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliedToAll" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" "DiscountUnit" NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliedToAll" BOOLEAN NOT NULL DEFAULT false,
    "minimumAmount" DOUBLE PRECISION,
    "maximumAmount" DOUBLE PRECISION,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_to_plan" (
    "discountId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "discount_to_plan_pkey" PRIMARY KEY ("discountId","planId")
);

-- CreateTable
CREATE TABLE "discount_to_package" (
    "discountId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "discount_to_package_pkey" PRIMARY KEY ("discountId","packageId")
);

-- CreateTable
CREATE TABLE "discount_to_user" (
    "discountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "discount_to_user_pkey" PRIMARY KEY ("discountId","userId")
);

-- CreateTable
CREATE TABLE "promotion_to_user" (
    "promotionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "promotion_to_user_pkey" PRIMARY KEY ("promotionId","userId")
);

-- CreateTable
CREATE TABLE "promotion_to_plan" (
    "promotionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "promotion_to_plan_pkey" PRIMARY KEY ("promotionId","planId")
);

-- CreateTable
CREATE TABLE "promotion_to_package" (
    "promotionId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "promotion_to_package_pkey" PRIMARY KEY ("promotionId","packageId")
);

-- CreateTable
CREATE TABLE "usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "max_projects" INTEGER NOT NULL DEFAULT 0,
    "remaining_projects" INTEGER NOT NULL DEFAULT 0,
    "max_teams" INTEGER NOT NULL DEFAULT 0,
    "remaining_teams" INTEGER NOT NULL DEFAULT 0,
    "max_proposals" INTEGER NOT NULL DEFAULT 0,
    "remaining_proposals" INTEGER NOT NULL DEFAULT 0,
    "max_requests" INTEGER NOT NULL DEFAULT 0,
    "remaining_requests" INTEGER NOT NULL DEFAULT 0,
    "max_storage_gb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "remaining_storage_gb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_credits" INTEGER NOT NULL DEFAULT 0,
    "remaining_credits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_queue" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "nextRetryAt" TIMESTAMP(3),

    CONSTRAINT "webhook_queue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "billing_events_subscriptionId_idx" ON "billing_events"("subscriptionId");

-- CreateIndex
CREATE INDEX "billing_events_creditPurchaseId_idx" ON "billing_events"("creditPurchaseId");

-- CreateIndex
CREATE INDEX "billing_events_status_idx" ON "billing_events"("status");

-- CreateIndex
CREATE INDEX "billing_events_startDate_endDate_idx" ON "billing_events"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "promotion_isActive_idx" ON "promotion"("isActive");

-- CreateIndex
CREATE INDEX "promotion_validFrom_validUntil_idx" ON "promotion"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "discount_isActive_idx" ON "discount"("isActive");

-- CreateIndex
CREATE INDEX "discount_validFrom_validUntil_idx" ON "discount"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "discount_to_plan_planId_idx" ON "discount_to_plan"("planId");

-- CreateIndex
CREATE INDEX "discount_to_package_packageId_idx" ON "discount_to_package"("packageId");

-- CreateIndex
CREATE INDEX "discount_to_user_userId_idx" ON "discount_to_user"("userId");

-- CreateIndex
CREATE INDEX "promotion_to_user_userId_idx" ON "promotion_to_user"("userId");

-- CreateIndex
CREATE INDEX "promotion_to_plan_planId_idx" ON "promotion_to_plan"("planId");

-- CreateIndex
CREATE INDEX "promotion_to_package_packageId_idx" ON "promotion_to_package"("packageId");

-- CreateIndex
CREATE INDEX "usage_userId_idx" ON "usage"("userId");

-- CreateIndex
CREATE INDEX "usage_createdAt_idx" ON "usage"("createdAt");

-- CreateIndex
CREATE INDEX "usage_updatedAt_idx" ON "usage"("updatedAt");

-- CreateIndex
CREATE INDEX "webhook_logs_userId_idx" ON "webhook_logs"("userId");

-- CreateIndex
CREATE INDEX "webhook_logs_topic_idx" ON "webhook_logs"("topic");

-- CreateIndex
CREATE INDEX "webhook_logs_createdAt_idx" ON "webhook_logs"("createdAt");

-- CreateIndex
CREATE INDEX "webhook_queue_status_attempts_idx" ON "webhook_queue"("status", "attempts");

-- CreateIndex
CREATE INDEX "webhook_queue_userId_idx" ON "webhook_queue"("userId");

-- CreateIndex
CREATE INDEX "webhook_queue_status_nextRetryAt_idx" ON "webhook_queue"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "webhook_queue_createdAt_idx" ON "webhook_queue"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "credit_packages_name_key" ON "credit_packages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "payments_subscription_id_key" ON "payments"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_purchase_id_key" ON "payments"("purchase_id");

-- CreateIndex
CREATE INDEX "payments_subscription_id_idx" ON "payments"("subscription_id");

-- CreateIndex
CREATE INDEX "payments_purchase_id_idx" ON "payments"("purchase_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_usage_id_fkey" FOREIGN KEY ("usage_id") REFERENCES "usage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_usage_id_fkey" FOREIGN KEY ("usage_id") REFERENCES "usage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "credit_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_creditPurchaseId_fkey" FOREIGN KEY ("creditPurchaseId") REFERENCES "credit_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_events" ADD CONSTRAINT "billing_events_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_plan" ADD CONSTRAINT "discount_to_plan_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_plan" ADD CONSTRAINT "discount_to_plan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_package" ADD CONSTRAINT "discount_to_package_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_package" ADD CONSTRAINT "discount_to_package_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_user" ADD CONSTRAINT "discount_to_user_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_to_user" ADD CONSTRAINT "discount_to_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_user" ADD CONSTRAINT "promotion_to_user_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_user" ADD CONSTRAINT "promotion_to_user_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_plan" ADD CONSTRAINT "promotion_to_plan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_plan" ADD CONSTRAINT "promotion_to_plan_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_package" ADD CONSTRAINT "promotion_to_package_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_to_package" ADD CONSTRAINT "promotion_to_package_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
