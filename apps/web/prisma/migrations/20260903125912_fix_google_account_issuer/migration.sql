-- The account_issuer migration backfilled providerId='google' rows with the
-- generic 'local:oauth:google' synthetic issuer. Better Auth's Google provider
-- actually sets accountIssuer: "https://accounts.google.com" (a real OIDC
-- issuer, not the synthetic fallback), so findAccountOwnerByKey couldn't find
-- these rows by (issuer, accountId) and re-linking a Google account collided
-- with the old (userId, providerId, accountId) unique constraint instead.
UPDATE "account"
SET "issuer" = 'https://accounts.google.com'
WHERE "providerId" = 'google';
