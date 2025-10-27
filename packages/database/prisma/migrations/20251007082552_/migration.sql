/*
  Warnings:

  - The values [INVESTOR,MENTOR,PARTNER] on the enum `ProposalType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProposalType_new" AS ENUM ('INVESTMENT', 'MENTORSHIP', 'TEAM', 'COFOUNDER', 'PARTNERSHIP', 'CUSTOMER');
ALTER TABLE "public"."requests" ALTER COLUMN "role_applied" TYPE "public"."ProposalType_new" USING ("role_applied"::text::"public"."ProposalType_new");
ALTER TABLE "public"."proposals" ALTER COLUMN "category" TYPE "public"."ProposalType_new" USING ("category"::text::"public"."ProposalType_new");
ALTER TYPE "public"."ProposalType" RENAME TO "ProposalType_old";
ALTER TYPE "public"."ProposalType_new" RENAME TO "ProposalType";
DROP TYPE "public"."ProposalType_old";
COMMIT;
