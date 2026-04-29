-- CreateTable
CREATE TABLE "dismissed_notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refKey" TEXT NOT NULL,
    "dismissedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dismissed_notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dismissed_notification_userId_idx" ON "dismissed_notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dismissed_notification_userId_refKey_key" ON "dismissed_notification"("userId", "refKey");

-- AddForeignKey
ALTER TABLE "dismissed_notification" ADD CONSTRAINT "dismissed_notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
