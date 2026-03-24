-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRecurringActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nextRecurDate" TIMESTAMP(3),
ADD COLUMN     "parentRecurringId" TEXT,
ADD COLUMN     "recurringEndDate" TIMESTAMP(3),
ADD COLUMN     "recurringFrequency" TEXT;

-- CreateIndex
CREATE INDEX "transaction_isRecurring_isRecurringActive_nextRecurDate_idx" ON "transaction"("isRecurring", "isRecurringActive", "nextRecurDate");

-- CreateIndex
CREATE INDEX "transaction_parentRecurringId_idx" ON "transaction"("parentRecurringId");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_parentRecurringId_fkey" FOREIGN KEY ("parentRecurringId") REFERENCES "transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
