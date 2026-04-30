-- AlterTable
ALTER TABLE "invoice" ADD COLUMN     "reminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "billReminderDays" INTEGER NOT NULL DEFAULT 1;
