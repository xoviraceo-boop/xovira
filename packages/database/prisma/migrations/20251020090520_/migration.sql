/*
  Warnings:

  - You are about to drop the column `usage_id` on the `credit_purchases` table. All the data in the column will be lost.
  - You are about to drop the column `usage_id` on the `subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[subscription_id]` on the table `usage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[credit_purchase_id]` on the table `usage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."credit_purchases" DROP CONSTRAINT "credit_purchases_package_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."credit_purchases" DROP CONSTRAINT "credit_purchases_usage_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_usage_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_user_id_fkey";

-- DropIndex
DROP INDEX "public"."credit_purchases_usage_id_key";

-- DropIndex
DROP INDEX "public"."credit_purchases_user_id_key";

-- DropIndex
DROP INDEX "public"."subscriptions_usage_id_key";

-- AlterTable
ALTER TABLE "credit_purchases" DROP COLUMN "usage_id";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "usage_id";

-- AlterTable
ALTER TABLE "usage" ADD COLUMN     "credit_purchase_id" TEXT,
ADD COLUMN     "subscription_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "usage_subscription_id_key" ON "usage"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_credit_purchase_id_key" ON "usage"("credit_purchase_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_credit_purchase_id_fkey" FOREIGN KEY ("credit_purchase_id") REFERENCES "credit_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
