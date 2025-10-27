/*
  Warnings:

  - The `status` column on the `credit_purchases` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'FROZEN', 'EXPIRED');

-- AlterTable
ALTER TABLE "credit_purchases" DROP COLUMN "status",
ADD COLUMN     "status" "PurchaseStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "public"."PackageStatus";
