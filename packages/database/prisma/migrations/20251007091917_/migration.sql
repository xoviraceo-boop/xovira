/*
  Warnings:

  - The `role_applied` column on the `requests` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('INVESTOR', 'MENTOR', 'TEAM', 'COFOUNDER', 'PARTNER', 'CUSTOMER');

-- AlterTable
ALTER TABLE "public"."requests" DROP COLUMN "role_applied",
ADD COLUMN     "role_applied" "public"."RoleType";
