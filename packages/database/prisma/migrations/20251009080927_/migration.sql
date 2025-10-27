-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('UPDATE', 'ANNOUNCEMENT', 'MILESTONE', 'MEDIA', 'POLL', 'ARTICLE', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('PUBLIC', 'CONNECTIONS', 'TEAM', 'PRIVATE');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('INTERNAL', 'EXTERNAL', 'EMBED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'SYSTEM', 'BOT', 'ADMIN');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'USER_UPDATE', 'USER_DELETE', 'PROJECT_CREATE', 'PROJECT_UPDATE', 'PROJECT_DELETE', 'PROJECT_PUBLISH', 'PROJECT_ARCHIVE', 'TEAM_CREATE', 'TEAM_UPDATE', 'TEAM_DELETE', 'MEMBER_ADD', 'MEMBER_REMOVE', 'MEMBER_ROLE_CHANGE', 'INVESTMENT_PROPOSE', 'INVESTMENT_ACCEPT', 'INVESTMENT_REJECT', 'PROPOSAL_CREATE', 'PROPOSAL_UPDATE', 'PROPOSAL_DELETE', 'PROPOSAL_PUBLISH', 'SYSTEM_MAINTENANCE', 'SYSTEM_UPDATE', 'SYSTEM_ALERT', 'SECURITY_LOGIN_FAILED', 'SECURITY_PASSWORD_CHANGE', 'SECURITY_2FA_ENABLE', 'SECURITY_SUSPICIOUS_ACTIVITY');

-- CreateEnum
CREATE TYPE "LogCategory" AS ENUM ('USER', 'PROJECT', 'TEAM', 'INVESTMENT', 'PROPOSAL', 'SYSTEM', 'SECURITY', 'NOTIFICATION', 'PAYMENT', 'CONTENT');

-- CreateEnum
CREATE TYPE "LogSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "LogVisibility" AS ENUM ('PUBLIC', 'TEAM', 'ADMIN', 'PRIVATE');

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "PostType" NOT NULL DEFAULT 'UPDATE',
    "project_id" TEXT,
    "team_id" TEXT,
    "attachments" TEXT[],
    "visibility" "PostVisibility" NOT NULL DEFAULT 'PUBLIC',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "edited_at" TIMESTAMP(3),

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "downvotes" INTEGER NOT NULL DEFAULT 0,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "edited_at" TIMESTAMP(3),

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_comment_votes" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vote_type" "VoteType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_comment_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_shares" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment" TEXT,
    "share_type" "ShareType" NOT NULL DEFAULT 'INTERNAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "actor_type" "ActorType" NOT NULL DEFAULT 'USER',
    "action" "LogAction" NOT NULL,
    "category" "LogCategory" NOT NULL,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "entity_type" TEXT,
    "entity_id" TEXT,
    "project_id" TEXT,
    "team_id" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "visibility" "LogVisibility" NOT NULL DEFAULT 'PRIVATE',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");

-- CreateIndex
CREATE INDEX "posts_project_id_idx" ON "posts"("project_id");

-- CreateIndex
CREATE INDEX "posts_team_id_idx" ON "posts"("team_id");

-- CreateIndex
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at");

-- CreateIndex
CREATE INDEX "posts_visibility_created_at_idx" ON "posts"("visibility", "created_at");

-- CreateIndex
CREATE INDEX "post_likes_user_id_idx" ON "post_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_likes_post_id_user_id_key" ON "post_likes"("post_id", "user_id");

-- CreateIndex
CREATE INDEX "post_comments_post_id_idx" ON "post_comments"("post_id");

-- CreateIndex
CREATE INDEX "post_comments_user_id_idx" ON "post_comments"("user_id");

-- CreateIndex
CREATE INDEX "post_comments_parent_id_idx" ON "post_comments"("parent_id");

-- CreateIndex
CREATE INDEX "post_comments_created_at_idx" ON "post_comments"("created_at");

-- CreateIndex
CREATE INDEX "post_comment_votes_user_id_idx" ON "post_comment_votes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_comment_votes_comment_id_user_id_key" ON "post_comment_votes"("comment_id", "user_id");

-- CreateIndex
CREATE INDEX "post_shares_post_id_idx" ON "post_shares"("post_id");

-- CreateIndex
CREATE INDEX "post_shares_user_id_idx" ON "post_shares"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_user_id_idx" ON "activity_logs"("user_id");

-- CreateIndex
CREATE INDEX "activity_logs_project_id_idx" ON "activity_logs"("project_id");

-- CreateIndex
CREATE INDEX "activity_logs_team_id_idx" ON "activity_logs"("team_id");

-- CreateIndex
CREATE INDEX "activity_logs_action_category_idx" ON "activity_logs"("action", "category");

-- CreateIndex
CREATE INDEX "activity_logs_created_at_idx" ON "activity_logs"("created_at");

-- CreateIndex
CREATE INDEX "activity_logs_entity_type_entity_id_idx" ON "activity_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comment_votes" ADD CONSTRAINT "post_comment_votes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comment_votes" ADD CONSTRAINT "post_comment_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_shares" ADD CONSTRAINT "post_shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
