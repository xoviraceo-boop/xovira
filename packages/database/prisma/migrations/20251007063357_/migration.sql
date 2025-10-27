/*
  Warnings:

  - The values [APPLICATION_SEND] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [APPLICATION_RECEIVED,APPLICATION_STATUS] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MANAGE_APPLICATIONS] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `invitations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `application_count` on the `project_analytics` table. All the data in the column will be lost.
  - You are about to drop the column `new_application_email` on the `user_settings` table. All the data in the column will be lost.
  - You are about to drop the `applications` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `target_type` on the `invitations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."RequestTargetType" AS ENUM ('PROJECT', 'TEAM', 'INVESTMENT', 'COLLABORATION');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ActivityType_new" AS ENUM ('LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'PROJECT_CREATE', 'PROJECT_UPDATE', 'Request_SEND', 'INVESTMENT_PROPOSE', 'MESSAGE_SEND', 'CONNECTION_REQUEST', 'REVIEW_GIVE');
ALTER TABLE "public"."user_activities" ALTER COLUMN "action" TYPE "public"."ActivityType_new" USING ("action"::text::"public"."ActivityType_new");
ALTER TYPE "public"."ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "public"."ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."NotificationType_new" AS ENUM ('Request_RECEIVED', 'Request_STATUS', 'INVITATION_RECEIVED', 'INVITATION_STATUS', 'MESSAGE_RECEIVED', 'CONNECTION_REQUEST', 'PROJECT_UPDATE', 'INVESTMENT_UPDATE', 'MILESTONE_COMPLETED', 'TEAM_INVITATION', 'REVIEW_RECEIVED', 'VERIFICATION_STATUS', 'SYSTEM_ANNOUNCEMENT');
ALTER TABLE "public"."notifications" ALTER COLUMN "type" TYPE "public"."NotificationType_new" USING ("type"::text::"public"."NotificationType_new");
ALTER TYPE "public"."NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "public"."NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Permission_new" AS ENUM ('VIEW_PROJECT', 'EDIT_PROJECT', 'DELETE_PROJECT', 'MANAGE_MEMBERS', 'MANAGE_FINANCES', 'MANAGE_INVESTORS', 'VIEW_ANALYTICS', 'EDIT_PROFILE', 'MANAGE_RequestS', 'MANAGE_INVITATIONS', 'CREATE_UPDATES', 'MANAGE_MILESTONES', 'ADMIN_ACCESS');
ALTER TABLE "public"."project_members" ALTER COLUMN "permissions" TYPE "public"."Permission_new"[] USING ("permissions"::text::"public"."Permission_new"[]);
ALTER TABLE "public"."team_members" ALTER COLUMN "permissions" TYPE "public"."Permission_new"[] USING ("permissions"::text::"public"."Permission_new"[]);
ALTER TYPE "public"."Permission" RENAME TO "Permission_old";
ALTER TYPE "public"."Permission_new" RENAME TO "Permission";
DROP TYPE "public"."Permission_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."applications" DROP CONSTRAINT "applications_project_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."applications" DROP CONSTRAINT "applications_proposal_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."applications" DROP CONSTRAINT "applications_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."applications" DROP CONSTRAINT "applications_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."applications" DROP CONSTRAINT "applications_team_id_fkey";

-- AlterTable
ALTER TABLE "public"."invitations" DROP COLUMN "target_type",
ADD COLUMN     "target_type" "public"."RequestTargetType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."project_analytics" DROP COLUMN "application_count",
ADD COLUMN     "Request_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."user_settings" DROP COLUMN "new_application_email",
ADD COLUMN     "new_Request_email" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "public"."applications";

-- DropEnum
DROP TYPE "public"."ApplicationStatus";

-- DropEnum
DROP TYPE "public"."ApplicationTargetType";

-- CreateTable
CREATE TABLE "public"."Requests" (
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

    CONSTRAINT "Requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Requests" ADD CONSTRAINT "Requests_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
