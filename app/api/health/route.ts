import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import packageJson from "@/package.json";

const startTime = Date.now();

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const version = packageJson.version;

  let databaseStatus: "ok" | "error" = "ok";

  try {
    await db.$queryRaw`SELECT 1`;
  } catch {
    databaseStatus = "error";
  }

  const healthy = databaseStatus === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      version,
      uptime,
      database: databaseStatus,
      timestamp,
    },
    { status: healthy ? 200 : 503 },
  );
}
