-- AlterTable
-- Add nullable first so existing rows can be backfilled before enforcing NOT NULL.
ALTER TABLE "account" ADD COLUMN "issuer" TEXT;

-- Backfill existing rows with Better Auth's synthetic issuer values, matching
-- createLocalAccountIssuer("credential") / createOAuthAccountIssuer(providerId).
UPDATE "account"
SET "issuer" = CASE
  WHEN "providerId" = 'credential' THEN 'local:credential'
  ELSE 'local:oauth:' || "providerId"
END
WHERE "issuer" IS NULL;

-- AlterTable
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "account_issuer_accountId_key" ON "account"("issuer", "accountId");
