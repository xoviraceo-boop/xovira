-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'SUSPENDED';

-- CreateTable
CREATE TABLE "user_likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_likes" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_likes_target_user_id_idx" ON "user_likes"("target_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_likes_user_id_target_user_id_key" ON "user_likes"("user_id", "target_user_id");

-- CreateIndex
CREATE INDEX "team_likes_user_id_idx" ON "team_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_likes_team_id_user_id_key" ON "team_likes"("team_id", "user_id");

-- AddForeignKey
ALTER TABLE "user_likes" ADD CONSTRAINT "user_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_likes" ADD CONSTRAINT "user_likes_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_likes" ADD CONSTRAINT "team_likes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_likes" ADD CONSTRAINT "team_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
