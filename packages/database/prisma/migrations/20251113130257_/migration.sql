/*
  Warnings:

  - You are about to alter the column `embedding` on the `founder_profiles` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `investor_profiles` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `proposals` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `spaces` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `users` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.
  - You are about to alter the column `embedding` on the `workspaces` table. The data in that column could be lost. The data in that column will be cast from `vector(1536)` to `Unsupported("vector(1536)")`.

*/
-- AlterTable
ALTER TABLE "ai_conversations" ADD COLUMN     "channel_id" TEXT,
ADD COLUMN     "space_id" TEXT,
ADD COLUMN     "workspace_id" TEXT;

-- AlterTable
ALTER TABLE "founder_profiles" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "investor_profiles" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "space_id" TEXT,
ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "space_id" TEXT,
ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "spaces" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "space_id" TEXT,
ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- AlterTable
ALTER TABLE "workspaces" ALTER COLUMN "embedding" SET DATA TYPE vector(1536);

-- CreateIndex
CREATE INDEX "ai_conversations_workspace_id_idx" ON "ai_conversations"("workspace_id");

-- CreateIndex
CREATE INDEX "ai_conversations_space_id_idx" ON "ai_conversations"("space_id");

-- CreateIndex
CREATE INDEX "ai_conversations_channel_id_idx" ON "ai_conversations"("channel_id");

-- CreateIndex
CREATE INDEX "projects_space_id_idx" ON "projects"("space_id");

-- CreateIndex
CREATE INDEX "teams_space_id_idx" ON "teams"("space_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
