/*
  Warnings:

  - You are about to drop the column `features` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `max_projects` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `max_proposals` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `max_requests` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `max_storage_gb` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `max_teams` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `monthly_credits` on the `plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plans" DROP COLUMN "features",
DROP COLUMN "max_projects",
DROP COLUMN "max_proposals",
DROP COLUMN "max_requests",
DROP COLUMN "max_storage_gb",
DROP COLUMN "max_teams",
DROP COLUMN "monthly_credits",
ADD COLUMN     "creditAmount" INTEGER;

-- CreateTable
CREATE TABLE "features" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT[],
    "max_projects" INTEGER NOT NULL DEFAULT 0,
    "max_teams" INTEGER NOT NULL DEFAULT 0,
    "max_proposals" INTEGER NOT NULL DEFAULT 0,
    "max_requests" INTEGER NOT NULL DEFAULT 0,
    "max_storage_gb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plan_id" TEXT,
    "package_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "features_plan_id_key" ON "features"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "features_package_id_key" ON "features"("package_id");

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "credit_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
