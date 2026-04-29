-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "previousBalanceOwed" DOUBLE PRECISION NOT NULL DEFAULT 0;
