-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookQueue" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookQueue_status_attempts_idx" ON "WebhookQueue"("status", "attempts");

-- CreateIndex
CREATE INDEX "WebhookQueue_shop_idx" ON "WebhookQueue"("shop");
