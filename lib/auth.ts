import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
// import { PrismaClient } from "@/generated/prisma/client";
import db from "./db";

// const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
});