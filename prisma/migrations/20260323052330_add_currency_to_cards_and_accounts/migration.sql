-- AlterTable
ALTER TABLE "credit_card" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'AED';

-- AlterTable
ALTER TABLE "bank_account" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'AED';
