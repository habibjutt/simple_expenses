/**
 * Usage:
 *   npx tsx scripts/set-trial.ts <email> <days>
 *
 * Examples:
 *   npx tsx scripts/set-trial.ts trackagent.ai@gmail.com 0    # expire trial now (free plan)
 *   npx tsx scripts/set-trial.ts trackagent.ai@gmail.com 14   # reset to 14-day trial
 *   npx tsx scripts/set-trial.ts trackagent.ai@gmail.com 1    # 1 day left
 *   npx tsx scripts/set-trial.ts trackagent.ai@gmail.com -1   # expired yesterday
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const email = process.argv[2];
const days = Number(process.argv[3]);

if (!email || isNaN(days)) {
  console.error("Usage: npx tsx scripts/set-trial.ts <email> <days>");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    console.error(`❌ No user found with email: ${email}`);
    process.exit(1);
  }

  const trialEndsAt = new Date(Date.now() + days * 86_400_000);

  await prisma.user.update({
    where: { id: user.id },
    data: { trialEndsAt },
  });

  const expired = trialEndsAt < new Date();
  console.log(`✅ Trial updated for ${email}`);
  console.log(`   trialEndsAt : ${trialEndsAt.toISOString()}`);
  console.log(`   Status      : ${expired ? "⛔ expired (free plan limits active)" : `⏳ ${days} day(s) remaining`}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
