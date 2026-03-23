-- CreateIndex
CREATE INDEX "audit_log_userId_createdAt_idx" ON "audit_log"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "invoice_creditCardId_isPaid_idx" ON "invoice"("creditCardId", "isPaid");

-- CreateIndex
CREATE INDEX "invoice_creditCardId_billStartDate_idx" ON "invoice"("creditCardId", "billStartDate");

-- CreateIndex
CREATE INDEX "spending_limit_userId_month_year_idx" ON "spending_limit"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "transaction_creditCardId_createdAt_idx" ON "transaction"("creditCardId", "createdAt");

-- CreateIndex
CREATE INDEX "transaction_bankAccountId_createdAt_idx" ON "transaction"("bankAccountId", "createdAt");

-- CreateIndex
CREATE INDEX "transaction_category_idx" ON "transaction"("category");
