-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "installmentNumber" INTEGER,
ADD COLUMN     "parentTransactionId" TEXT;

-- CreateIndex
CREATE INDEX "transaction_parentTransactionId_idx" ON "transaction"("parentTransactionId");

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_parentTransactionId_fkey" FOREIGN KEY ("parentTransactionId") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
