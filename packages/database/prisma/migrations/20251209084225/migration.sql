-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "file_mime_type" TEXT,
ADD COLUMN     "file_name" TEXT,
ADD COLUMN     "file_size" BIGINT,
ADD COLUMN     "file_url" TEXT;
