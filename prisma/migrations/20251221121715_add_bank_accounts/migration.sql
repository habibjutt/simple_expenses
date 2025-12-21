-- AlterTable
ALTER TABLE "transaction" ADD COLUMN     "bankAccountId" TEXT,
ALTER COLUMN "creditCardId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "bank_account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initialBalance" DOUBLE PRECISION NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_account_userId_idx" ON "bank_account"("userId");

-- CreateIndex
CREATE INDEX "transaction_bankAccountId_idx" ON "transaction"("bankAccountId");

-- AddForeignKey
ALTER TABLE "bank_account" ADD CONSTRAINT "bank_account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
