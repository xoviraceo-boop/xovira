/*
  Warnings:

  - The values [Request_SEND] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [Request_RECEIVED,Request_STATUS] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MANAGE_RequestS] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `Request_count` on the `project_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `new_Request_email` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the `Requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ActivityType_new" AS ENUM ('LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'PROJECT_CREATE', 'PROJECT_UPDATE', 'REQUEST_SEND', 'INVESTMENT_PROPOSE', 'MESSAGE_SEND', 'CONNECTION_REQUEST', 'REVIEW_GIVE');
ALTER TABLE "public"."user_activities" ALTER COLUMN "action" TYPE "public"."ActivityType_new" USING ("action"::text::"public"."ActivityType_new");
ALTER TYPE "public"."ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "public"."ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."NotificationType_new" AS ENUM ('REQUEST_RECEIVED', 'REQUEST_STATUS', 'INVITATION_RECEIVED', 'INVITATION_STATUS', 'MESSAGE_RECEIVED', 'CONNECTION_REQUEST', 'PROJECT_UPDATE', 'INVESTMENT_UPDATE', 'MILESTONE_COMPLETED', 'TEAM_INVITATION', 'REVIEW_RECEIVED', 'VERIFICATION_STATUS', 'SYSTEM_ANNOUNCEMENT');
ALTER TABLE "public"."notifications" ALTER COLUMN "type" TYPE "public"."NotificationType_new" USING ("type"::text::"public"."NotificationType_new");
ALTER TYPE "public"."NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "public"."NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Permission_new" AS ENUM ('VIEW_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'MANAGE_MEMBERS', 'MANAGE_FINANCES', 'MANAGE_INVESTORS', 'VIEW_ANALYTICS', 'EDIT_PROFILE', 'MANAGE_REQUESTS', 'MANAGE_INVITATIONS', 'CREATE_UPDATES', 'MANAGE_MILESTONES', 'ADMIN_ACCESS');
ALTER TABLE "public"."project_members" ALTER COLUMN "permissions" TYPE "public"."Permission_new"[] USING ("permissions"::text::"public"."Permission_new"[]);
ALTER TABLE "public"."team_members" ALTER COLUMN "permissions" TYPE "public"."Permission_new"[] USING ("permissions"::text::"public"."Permission_new"[]);
ALTER TYPE "public"."Permission" RENAME TO "Permission_old";
ALTER TYPE "public"."Permission_new" RENAME TO "Permission";
DROP TYPE "public"."Permission_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Requests" DROP CONSTRAINT "Requests_project_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requests" DROP CONSTRAINT "Requests_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requests" DROP CONSTRAINT "Requests_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requests" DROP CONSTRAINT "Requests_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Requests" DROP CONSTRAINT "Requests_team_id_fkey";

-- AlterTable
ALTER TABLE "public"."project_analytics" DROP COLUMN "Request_count",
ADD COLUMN     "request_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."user_settings" DROP COLUMN "new_Request_email",
ADD COLUMN     "new_request_email" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "public"."Requests";

-- CreateTable
CREATE TABLE "public"."requests" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "target_type" "public"."RequestTargetType" NOT NULL,
    "project_id" TEXT,
    "team_id" TEXT,
    "proposal_id" TEXT,
    "role_applied" "public"."ProposalType",
    "role" TEXT,
    "message" TEXT NOT NULL,
    "proposed_terms" JSONB,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "response" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
