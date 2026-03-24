-- AlterTable: add OAuth token fields required by Better Auth social providers
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "scope" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);
