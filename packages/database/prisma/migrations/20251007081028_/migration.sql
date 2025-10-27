-- DropIndex
DROP INDEX "public"."proposals_slug_key";

-- AlterTable
ALTER TABLE "public"."proposals" ALTER COLUMN "slug" DROP NOT NULL;
