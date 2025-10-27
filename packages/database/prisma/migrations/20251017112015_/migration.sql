/*
  Warnings:

  - A unique constraint covering the columns `[stripe_price_id]` on the table `plans` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paypal_plan_id]` on the table `plans` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "paypal_plan_id" TEXT,
ADD COLUMN     "stripe_price_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "plans_stripe_price_id_key" ON "plans"("stripe_price_id");

-- CreateIndex
CREATE UNIQUE INDEX "plans_paypal_plan_id_key" ON "plans"("paypal_plan_id");
