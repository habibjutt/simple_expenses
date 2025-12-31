import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

const cardId = "cmjfrtii4000eq1s53pal020y";

const invoices = await db.invoice.findMany({
  where: {
    creditCardId: cardId,
  },
  orderBy: {
    billStartDate: 'desc',
  },
});

console.log(`\nFound ${invoices.length} invoices for card ${cardId}:\n`);

invoices.forEach((inv, idx) => {
  console.log(`Invoice ${idx + 1}:`);
  console.log(`  ID: ${inv.id}`);
  console.log(`  billStartDate: ${inv.billStartDate} (${inv.billStartDate.toISOString()})`);
  console.log(`  billEndDate: ${inv.billEndDate} (${inv.billEndDate.toISOString()})`);
  console.log(`  isPaid: ${inv.isPaid}`);
  console.log(`  paidAt: ${inv.paidAt}`);
  console.log(`  totalAmount: ${inv.totalAmount}`);
  console.log(`  paidAmount: ${inv.paidAmount}`);
  console.log('');
});

await db.$disconnect();
