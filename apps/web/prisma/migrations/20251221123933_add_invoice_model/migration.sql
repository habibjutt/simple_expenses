-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "creditCardId" TEXT NOT NULL,
    "billStartDate" TIMESTAMP(3) NOT NULL,
    "billEndDate" TIMESTAMP(3) NOT NULL,
    "paymentDueDate" TIMESTAMP(3) NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "paidFromBankAccountId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoice_creditCardId_idx" ON "invoice"("creditCardId");

-- CreateIndex
CREATE INDEX "invoice_isPaid_idx" ON "invoice"("isPaid");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_creditCardId_billStartDate_billEndDate_key" ON "invoice"("creditCardId", "billStartDate", "billEndDate");

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "credit_card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_paidFromBankAccountId_fkey" FOREIGN KEY ("paidFromBankAccountId") REFERENCES "bank_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
