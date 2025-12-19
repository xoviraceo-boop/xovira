/*
  Warnings:

  - You are about to alter the column `embedding` on the `founder_profiles` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `investor_profiles` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `member_profiles` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `proposals` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.

*/
-- AlterTable
ALTER TABLE "founder_profiles" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "investor_profiles" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "member_profiles" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "hiring_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "proposals" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "hiring_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "embedding" SET DATA TYPE vector(1536);
