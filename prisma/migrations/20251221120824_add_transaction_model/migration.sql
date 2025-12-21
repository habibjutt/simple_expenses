-- CreateTable
CREATE TABLE "credit_card" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billGenerationDate" INTEGER NOT NULL,
    "paymentDate" INTEGER NOT NULL,
    "cardLimit" DOUBLE PRECISION NOT NULL,
    "availableBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "installments" INTEGER NOT NULL DEFAULT 1,
    "creditCardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "credit_card_userId_idx" ON "credit_card"("userId");

-- CreateIndex
CREATE INDEX "transaction_creditCardId_idx" ON "transaction"("creditCardId");

-- CreateIndex
CREATE INDEX "transaction_date_idx" ON "transaction"("date");

-- AddForeignKey
ALTER TABLE "credit_card" ADD CONSTRAINT "credit_card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "credit_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
