/*
  Warnings:

  - Added the required column `intent` to the `proposals` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ProposalIntent" AS ENUM ('SEEKING', 'OFFERING');

-- DropIndex
DROP INDEX "public"."proposals_category_status_created_at_idx";

-- AlterTable
ALTER TABLE "public"."proposals" ADD COLUMN     "intent" "public"."ProposalIntent" NOT NULL;

-- CreateIndex
CREATE INDEX "proposals_category_intent_status_created_at_idx" ON "public"."proposals"("category", "intent", "status", "created_at");
