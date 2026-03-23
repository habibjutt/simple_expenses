#!/usr/bin/env node
/**
 * Hook: prisma-sync
 * Fires after any file-edit tool. If prisma/schema.prisma was modified,
 * automatically runs `prisma migrate dev` and `prisma generate` to keep
 * the database and generated client in sync.
 *
 * Input: VS Code PostToolUse JSON payload via stdin
 * Output: JSON systemMessage to stdout (shown in Copilot Chat)
 */

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// ── 1. Parse the PostToolUse payload ────────────────────────────────────────

let data;
try {
  data = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0); // not a JSON payload — ignore silently
}

// ── 2. Detect whether prisma/schema.prisma was touched ──────────────────────

const SCHEMA_RE = /prisma[/\\]schema\.prisma$/i;
const input = data.tool_input ?? {};
let schemaModified = false;

// replace_string_in_file / create_file → tool_input.filePath
if (input.filePath && SCHEMA_RE.test(input.filePath)) {
  schemaModified = true;
}

// multi_replace_string_in_file → tool_input.replacements[].filePath
if (!schemaModified && Array.isArray(input.replacements)) {
  schemaModified = input.replacements.some(
    (r) => r?.filePath && SCHEMA_RE.test(r.filePath),
  );
}

if (!schemaModified) {
  process.exit(0); // not a schema change — nothing to do
}

// ── 3. Run migrate dev + generate ───────────────────────────────────────────

const cwd = data.cwd ?? process.cwd();
const ts = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
const migrationName = `auto_${ts}`;

function out(message) {
  process.stdout.write(JSON.stringify({ systemMessage: message }));
}

try {
  console.error(
    `[prisma-sync] schema.prisma changed — running: prisma migrate dev --name ${migrationName}`,
  );
  execSync(`npx prisma migrate dev --name ${migrationName}`, {
    cwd,
    stdio: 'inherit',
  });

  console.error('[prisma-sync] Running: prisma generate');
  execSync('npx prisma generate', { cwd, stdio: 'inherit' });

  out(
    'Prisma DB synced: migration applied and client regenerated successfully.',
  );
  process.exit(0);
} catch {
  out(
    'Prisma sync failed after schema edit — run manually:\n' +
      '  npx prisma migrate dev\n' +
      '  npx prisma generate',
  );
  process.exit(1); // non-zero exit → VS Code shows a non-blocking warning
}
