/*
  Warnings:

  - You are about to alter the column `embedding` on the `founder_profiles` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `investor_profiles` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to drop the column `embedding` on the `member_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `embedding_updated_at` on the `member_profiles` table. All the data in the column will be lost.
  - You are about to alter the column `embedding` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `proposals` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.

*/
-- AlterTable
ALTER TABLE "founder_profiles" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "investor_profiles" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "member_profiles" DROP COLUMN "embedding",
DROP COLUMN "embedding_updated_at";

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "proposals" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "embedding_updated_at" TIMESTAMP(3);
