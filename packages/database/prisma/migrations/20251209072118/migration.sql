/*
  Warnings:

  - You are about to drop the column `file_mime_type` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `file_name` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `file_size` on the `resources` table. All the data in the column will be lost.
  - You are about to drop the column `file_url` on the `resources` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "thumbnail_url" TEXT;

-- AlterTable
ALTER TABLE "resources" DROP COLUMN "file_mime_type",
DROP COLUMN "file_name",
DROP COLUMN "file_size",
DROP COLUMN "file_url";

-- AlterTable
ALTER TABLE "tools" ADD COLUMN     "thumbnail_url" TEXT;
