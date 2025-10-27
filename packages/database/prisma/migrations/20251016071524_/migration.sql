/*
  Warnings:

  - The `payment_gateway` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('PAYPAL', 'STRIPE');

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "payment_gateway",
ADD COLUMN     "payment_gateway" "PaymentGateway";
