-- Reconcile drift: rateLimit_key_idx was removed from the DB after it was created by migration
-- 20260323120000_add_rate_limit. Drop it if it still exists.
DROP INDEX IF EXISTS "rateLimit_key_idx";

-- Drop the unused expense_account table (no userId, never user-scoped, dead code).
DROP TABLE IF EXISTS "expense_account";