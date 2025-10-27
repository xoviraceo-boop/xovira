-- CreateEnum
CREATE TYPE "MembershipDirection" AS ENUM ('SEEKING_MEMBERSHIP', 'OFFERING_MEMBERSHIP');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'BASIC', 'PROFESSIONAL', 'BUSINESS', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'UNPAID', 'PAUSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CRYPTO', 'OTHER');

-- CreateEnum
CREATE TYPE "Interval" AS ENUM ('EVERY_30_DAYS', 'ANNUAL');

-- CreateEnum
CREATE TYPE "PromotionUnit" AS ENUM ('PERCENTAGE', 'AMOUNT', 'CREDITS', 'DAYS', 'REQUESTS', 'TOKENS');

-- CreateEnum
CREATE TYPE "DiscountUnit" AS ENUM ('PERCENTAGE', 'AMOUNT', 'CREDITS', 'REQUESTS', 'TOKENS');

-- CreateEnum
CREATE TYPE "BillingType" AS ENUM ('SUBSCRIPTION', 'PAY_AS_YOU_GO', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "Package" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PackageStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'FROZEN', 'EXPIRED', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "BillingEventType" AS ENUM ('PROMOTION', 'DISCOUNT', 'CREDIT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "BillingEventStatus" AS ENUM ('PENDING', 'APPLIED', 'FAILED', 'REVERSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_TRIAL', 'USAGE_BOOST', 'CREDIT_BONUS', 'TIME_EXTENSION', 'TIER_UPGRADE', 'EARLY_ADAPTER');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'VOLUME', 'LOYALTY', 'SEASONAL', 'REFERRAL', 'EARLY_ADAPTER', 'BUNDLE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LogAction" ADD VALUE 'PROJECT_TRANSFER';
ALTER TYPE "LogAction" ADD VALUE 'MEMBER_BLOCK';
ALTER TYPE "LogAction" ADD VALUE 'MEMBER_UNBLOCK';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'USAGE_ALERT';
ALTER TYPE "NotificationType" ADD VALUE 'FEATURE_UPDATE';
ALTER TYPE "NotificationType" ADD VALUE 'BILLING';
ALTER TYPE "NotificationType" ADD VALUE 'MAINTENANCE';
ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT';
ALTER TYPE "NotificationType" ADD VALUE 'SUBSCRIPTION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'TRANSFER_OWNERSHIP';
ALTER TYPE "Permission" ADD VALUE 'BLOCK_MEMBERS';
ALTER TYPE "Permission" ADD VALUE 'MANAGE_PERMISSIONS';

-- AlterEnum
ALTER TYPE "ProposalType" ADD VALUE 'MEMBERSHIP';

-- AlterEnum
ALTER TYPE "RoleType" ADD VALUE 'MEMBER';

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "project_members" ADD COLUMN     "block_reason" TEXT,
ADD COLUMN     "blocked_at" TIMESTAMP(3),
ADD COLUMN     "blocked_by" TEXT,
ADD COLUMN     "can_comment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "can_post" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "can_view_project" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "previous_owner_id" TEXT,
ADD COLUMN     "transferred_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "project_ownership_transfers" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "from_owner_id" TEXT NOT NULL,
    "to_owner_id" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "requires_acceptance" BOOLEAN NOT NULL DEFAULT true,
    "acceptance_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "project_ownership_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_blocked_members" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blocked_by" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "block_post" BOOLEAN NOT NULL DEFAULT true,
    "block_comment" BOOLEAN NOT NULL DEFAULT true,
    "block_view" BOOLEAN NOT NULL DEFAULT false,
    "blocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unblocked_at" TIMESTAMP(3),
    "unblocked_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "project_blocked_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_proposals" (
    "id" TEXT NOT NULL,
    "seeking_or_offering" "MembershipDirection" NOT NULL,
    "role_title" VARCHAR(100) NOT NULL,
    "department" VARCHAR(50),
    "custom_role" VARCHAR(100),
    "key_responsibilities" TEXT[],
    "required_skills" TEXT[],
    "preferred_skills" TEXT[],
    "experience_level" "SeniorityLevel",
    "years_experience" INTEGER,
    "compensation_type" "CompensationType",
    "salary_range" JSONB,
    "equity_range" JSONB,
    "benefits" TEXT[],
    "time_commitment" "Commitment",
    "hours_per_week" INTEGER,
    "start_date" TIMESTAMP(3),
    "duration" TEXT,
    "work_arrangement" "WorkArrangement" NOT NULL DEFAULT 'HYBRID',
    "what_offered" TEXT,
    "what_expected" TEXT,
    "project_stage" "StartupStage",
    "team_size" INTEGER,
    "company_values" TEXT[],
    "team_culture" TEXT,
    "current_position" TEXT,
    "portfolio_url" TEXT,
    "availability" "Availability",
    "permissions" "Permission"[],
    "decision_authority" TEXT[],
    "proposal_id" TEXT NOT NULL,

    CONSTRAINT "membership_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "plan_type" "PlanType" NOT NULL,
    "billing_period" "BillingPeriod" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "cappedAmount" INTEGER,
    "max_projects" INTEGER NOT NULL DEFAULT 0,
    "max_teams" INTEGER NOT NULL DEFAULT 0,
    "max_proposals" INTEGER NOT NULL DEFAULT 0,
    "max_requests" INTEGER NOT NULL DEFAULT 0,
    "max_storage_gb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthly_credits" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "usage_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "cancelReason" TEXT,
    "canceled_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "trial_start" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "credit_amount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "bonus_credits" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "validity_days" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "credit_amount" INTEGER NOT NULL,
    "bonus_credits" INTEGER NOT NULL DEFAULT 0,
    "total_credits" INTEGER NOT NULL,
    "usage_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "PackageStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3),
    "purchased_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "credit_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "user_id" TEXT NOT NULL,
    "billingType" "BillingType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "adjustedAmount" DOUBLE PRECISION,
    "billingPeriodStart" TIMESTAMP(3),
    "billingPeriodEnd" TIMESTAMP(3),
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_gateway" TEXT,
    "failure_reason" TEXT,
    "receipt_url" TEXT,
    "refundId" TEXT,
    "refundReason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingEvent" (
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

    CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
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

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discount" (
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

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscountToPlan" (
    "discountId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "DiscountToPlan_pkey" PRIMARY KEY ("discountId","planId")
);

-- CreateTable
CREATE TABLE "DiscountToPackage" (
    "discountId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "DiscountToPackage_pkey" PRIMARY KEY ("discountId","packageId")
);

-- CreateTable
CREATE TABLE "DiscountToUser" (
    "discountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DiscountToUser_pkey" PRIMARY KEY ("discountId","userId")
);

-- CreateTable
CREATE TABLE "PromotionToUser" (
    "promotionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PromotionToUser_pkey" PRIMARY KEY ("promotionId","userId")
);

-- CreateTable
CREATE TABLE "PromotionToPlan" (
    "promotionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,

    CONSTRAINT "PromotionToPlan_pkey" PRIMARY KEY ("promotionId","planId")
);

-- CreateTable
CREATE TABLE "PromotionToPackage" (
    "promotionId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,

    CONSTRAINT "PromotionToPackage_pkey" PRIMARY KEY ("promotionId","packageId")
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "max_projects" INTEGER NOT NULL DEFAULT 0,
    "remainingProjects" INTEGER,
    "max_teams" INTEGER NOT NULL DEFAULT 0,
    "remainingTeams" INTEGER,
    "max_proposals" INTEGER NOT NULL DEFAULT 0,
    "max_requests" INTEGER NOT NULL DEFAULT 0,
    "max_connections" INTEGER NOT NULL DEFAULT 0,
    "max_messages" INTEGER NOT NULL DEFAULT 0,
    "max_storage_gb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_credits" INTEGER NOT NULL DEFAULT 0,
    "remainingCredits" INTEGER,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quotas" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" TEXT,
    "max_projects" INTEGER NOT NULL DEFAULT 0,
    "max_teams" INTEGER NOT NULL DEFAULT 0,
    "max_proposals" INTEGER NOT NULL DEFAULT 0,
    "max_requests" INTEGER NOT NULL DEFAULT 0,
    "max_connections" INTEGER NOT NULL DEFAULT 0,
    "max_messages" INTEGER NOT NULL DEFAULT 0,
    "max_storage_gb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_credits" INTEGER NOT NULL DEFAULT 0,
    "projects_owned" INTEGER NOT NULL DEFAULT 0,
    "teams_owned" INTEGER NOT NULL DEFAULT 0,
    "proposals_created" INTEGER NOT NULL DEFAULT 0,
    "requests_sent" INTEGER NOT NULL DEFAULT 0,
    "connections_count" INTEGER NOT NULL DEFAULT 0,
    "messages_sent" INTEGER NOT NULL DEFAULT 0,
    "storage_used_gb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_projects_created" INTEGER NOT NULL DEFAULT 0,
    "total_teams_created" INTEGER NOT NULL DEFAULT 0,
    "total_proposals_created" INTEGER NOT NULL DEFAULT 0,
    "total_requests_sent" INTEGER NOT NULL DEFAULT 0,
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "last_reset_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_ownership_transfers_acceptance_token_key" ON "project_ownership_transfers"("acceptance_token");

-- CreateIndex
CREATE INDEX "project_ownership_transfers_project_id_idx" ON "project_ownership_transfers"("project_id");

-- CreateIndex
CREATE INDEX "project_ownership_transfers_from_owner_id_idx" ON "project_ownership_transfers"("from_owner_id");

-- CreateIndex
CREATE INDEX "project_ownership_transfers_to_owner_id_idx" ON "project_ownership_transfers"("to_owner_id");

-- CreateIndex
CREATE INDEX "project_ownership_transfers_status_idx" ON "project_ownership_transfers"("status");

-- CreateIndex
CREATE INDEX "project_blocked_members_project_id_idx" ON "project_blocked_members"("project_id");

-- CreateIndex
CREATE INDEX "project_blocked_members_user_id_idx" ON "project_blocked_members"("user_id");

-- CreateIndex
CREATE INDEX "project_blocked_members_is_active_idx" ON "project_blocked_members"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "project_blocked_members_project_id_user_id_is_active_key" ON "project_blocked_members"("project_id", "user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "membership_proposals_proposal_id_key" ON "membership_proposals"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_name_key" ON "plans"("name");

-- CreateIndex
CREATE UNIQUE INDEX "plans_slug_key" ON "plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_usage_id_key" ON "subscriptions"("usage_id");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_plan_id_idx" ON "subscriptions"("plan_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_current_period_end_idx" ON "subscriptions"("current_period_end");

-- CreateIndex
CREATE UNIQUE INDEX "credit_purchases_user_id_key" ON "credit_purchases"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_purchases_payment_id_key" ON "credit_purchases"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_purchases_usage_id_key" ON "credit_purchases"("usage_id");

-- CreateIndex
CREATE INDEX "credit_purchases_user_id_idx" ON "credit_purchases"("user_id");

-- CreateIndex
CREATE INDEX "payments_user_id_idx" ON "payments"("user_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_subscriptionId_idx" ON "payments"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingEvent_subscriptionId_idx" ON "BillingEvent"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingEvent_creditPurchaseId_idx" ON "BillingEvent"("creditPurchaseId");

-- CreateIndex
CREATE INDEX "BillingEvent_status_idx" ON "BillingEvent"("status");

-- CreateIndex
CREATE INDEX "BillingEvent_startDate_endDate_idx" ON "BillingEvent"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Promotion_isActive_idx" ON "Promotion"("isActive");

-- CreateIndex
CREATE INDEX "Promotion_validFrom_validUntil_idx" ON "Promotion"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "Discount_isActive_idx" ON "Discount"("isActive");

-- CreateIndex
CREATE INDEX "Discount_validFrom_validUntil_idx" ON "Discount"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "DiscountToPlan_planId_idx" ON "DiscountToPlan"("planId");

-- CreateIndex
CREATE INDEX "DiscountToPackage_packageId_idx" ON "DiscountToPackage"("packageId");

-- CreateIndex
CREATE INDEX "DiscountToUser_userId_idx" ON "DiscountToUser"("userId");

-- CreateIndex
CREATE INDEX "PromotionToUser_userId_idx" ON "PromotionToUser"("userId");

-- CreateIndex
CREATE INDEX "PromotionToPlan_planId_idx" ON "PromotionToPlan"("planId");

-- CreateIndex
CREATE INDEX "PromotionToPackage_packageId_idx" ON "PromotionToPackage"("packageId");

-- CreateIndex
CREATE INDEX "Usage_userId_idx" ON "Usage"("userId");

-- CreateIndex
CREATE INDEX "Usage_createdAt_idx" ON "Usage"("createdAt");

-- CreateIndex
CREATE INDEX "Usage_updatedAt_idx" ON "Usage"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_quotas_user_id_key" ON "user_quotas"("user_id");

-- CreateIndex
CREATE INDEX "project_members_is_blocked_idx" ON "project_members"("is_blocked");

-- CreateIndex
CREATE INDEX "project_members_status_idx" ON "project_members"("status");

-- AddForeignKey
ALTER TABLE "project_ownership_transfers" ADD CONSTRAINT "project_ownership_transfers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ownership_transfers" ADD CONSTRAINT "project_ownership_transfers_from_owner_id_fkey" FOREIGN KEY ("from_owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_ownership_transfers" ADD CONSTRAINT "project_ownership_transfers_to_owner_id_fkey" FOREIGN KEY ("to_owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_blocked_members" ADD CONSTRAINT "project_blocked_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_blocked_members" ADD CONSTRAINT "project_blocked_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_blocked_members" ADD CONSTRAINT "project_blocked_members_blocked_by_fkey" FOREIGN KEY ("blocked_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_proposals" ADD CONSTRAINT "membership_proposals_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_usage_id_fkey" FOREIGN KEY ("usage_id") REFERENCES "Usage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "credit_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_usage_id_fkey" FOREIGN KEY ("usage_id") REFERENCES "Usage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_creditPurchaseId_fkey" FOREIGN KEY ("creditPurchaseId") REFERENCES "credit_purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountToPlan" ADD CONSTRAINT "DiscountToPlan_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountToPlan" ADD CONSTRAINT "DiscountToPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountToPackage" ADD CONSTRAINT "DiscountToPackage_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountToPackage" ADD CONSTRAINT "DiscountToPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountToUser" ADD CONSTRAINT "DiscountToUser_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountToUser" ADD CONSTRAINT "DiscountToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionToUser" ADD CONSTRAINT "PromotionToUser_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionToUser" ADD CONSTRAINT "PromotionToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionToPlan" ADD CONSTRAINT "PromotionToPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionToPlan" ADD CONSTRAINT "PromotionToPlan_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionToPackage" ADD CONSTRAINT "PromotionToPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionToPackage" ADD CONSTRAINT "PromotionToPackage_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quotas" ADD CONSTRAINT "user_quotas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
