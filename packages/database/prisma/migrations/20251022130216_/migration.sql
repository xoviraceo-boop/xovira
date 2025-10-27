/*
  Warnings:

  - A unique constraint covering the columns `[order_id]` on the table `credit_purchases` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sub_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "credit_purchases" ADD COLUMN     "order_id" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "sub_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "credit_purchases_order_id_key" ON "credit_purchases"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_sub_id_key" ON "subscriptions"("sub_id");
