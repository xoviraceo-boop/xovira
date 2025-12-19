-- CreateEnum
CREATE TYPE "MaterialStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ToolStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "status" "MaterialStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "tools" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "status" "ToolStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "productUrl" DROP NOT NULL;
