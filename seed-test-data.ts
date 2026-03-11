import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  // Find first user
  const users = await db.user.findMany({ select: { id: true, name: true, email: true } });
  console.log("Users found:", users);

  if (users.length === 0) {
    console.log("No users found. Please sign up first at http://localhost:3000/signup");
    return;
  }

  const userId = users[0].id;
  console.log(`\nSeeding data for user: ${users[0].email} (${userId})`);

  // Check existing data
  const existingCards = await db.credit_card.findMany({ where: { userId } });
  const existingAccounts = await db.bank_account.findMany({ where: { userId } });
  const existingTxns = await db.transaction.findMany({ where: { OR: [{ creditCard: { userId } }, { bankAccount: { userId } }] } });

  console.log(`\nExisting: ${existingCards.length} cards, ${existingAccounts.length} accounts, ${existingTxns.length} transactions`);

  // --- Bank Accounts ---
  let savingsAccount, currentAccount;
  if (existingAccounts.length === 0) {
    console.log("\nCreating bank accounts...");
    savingsAccount = await db.bank_account.create({
      data: { name: "Emirates NBD Savings", initialBalance: 15000, currentBalance: 15000, userId },
    });
    currentAccount = await db.bank_account.create({
      data: { name: "ADCB Current Account", initialBalance: 8500, currentBalance: 8500, userId },
    });
    console.log(`  ✓ Created: ${savingsAccount.name} (AED ${savingsAccount.currentBalance})`);
    console.log(`  ✓ Created: ${currentAccount.name} (AED ${currentAccount.currentBalance})`);
  } else {
    savingsAccount = existingAccounts[0];
    currentAccount = existingAccounts[1] || existingAccounts[0];
    console.log("  Bank accounts already exist, using existing ones.");
  }

  // --- Credit Cards ---
  let visaCard, mastercardCard;
  if (existingCards.length === 0) {
    console.log("\nCreating credit cards...");
    visaCard = await db.credit_card.create({
      data: {
        name: "Emirates NBD Visa Platinum",
        billGenerationDate: 1,
        paymentDate: 15,
        cardLimit: 20000,
        availableBalance: 14500,
        userId,
      },
    });
    mastercardCard = await db.credit_card.create({
      data: {
        name: "FAB World Mastercard",
        billGenerationDate: 10,
        paymentDate: 25,
        cardLimit: 30000,
        availableBalance: 27200,
        userId,
      },
    });
    console.log(`  ✓ Created: ${visaCard.name} (Limit: AED ${visaCard.cardLimit})`);
    console.log(`  ✓ Created: ${mastercardCard.name} (Limit: AED ${mastercardCard.cardLimit})`);
  } else {
    visaCard = existingCards[0];
    mastercardCard = existingCards[1] || existingCards[0];
    console.log("  Credit cards already exist, using existing ones.");
  }

  // --- Transactions ---
  if (existingTxns.length === 0) {
    console.log("\nCreating transactions...");
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const txns = [
      // Credit card transactions (Visa)
      { name: "Carrefour Grocery", amount: 342.50, category: "Groceries", date: new Date(thisYear, thisMonth, 3), creditCardId: visaCard.id, type: "expense" },
      { name: "Noon.com Purchase", amount: 189.00, category: "Shopping", date: new Date(thisYear, thisMonth, 5), creditCardId: visaCard.id, type: "expense" },
      { name: "Zomato Delivery", amount: 67.00, category: "Food & Dining", date: new Date(thisYear, thisMonth, 7), creditCardId: visaCard.id, type: "expense" },
      { name: "DEWA Bill", amount: 520.00, category: "Utilities", date: new Date(thisYear, thisMonth, 2), creditCardId: visaCard.id, type: "expense" },
      { name: "Etisalat Mobile", amount: 199.00, category: "Phone & Internet", date: new Date(thisYear, thisMonth, 1), creditCardId: visaCard.id, type: "expense" },
      // Mastercard transactions
      { name: "Emirates Flight Booking", amount: 1250.00, category: "Travel", date: new Date(thisYear, thisMonth, 8), creditCardId: mastercardCard.id, type: "expense" },
      { name: "Fitness First Gym", amount: 450.00, category: "Health & Fitness", date: new Date(thisYear, thisMonth, 1), creditCardId: mastercardCard.id, type: "expense" },
      { name: "VOX Cinemas", amount: 95.00, category: "Entertainment", date: new Date(thisYear, thisMonth, 6), creditCardId: mastercardCard.id, type: "expense" },
      // Bank account transactions
      { name: "Monthly Salary", amount: 18000.00, category: "Income", date: new Date(thisYear, thisMonth, 1), bankAccountId: savingsAccount.id, type: "income" },
      { name: "Rent Payment", amount: 7500.00, category: "Rent & Housing", date: new Date(thisYear, thisMonth, 2), bankAccountId: savingsAccount.id, type: "expense" },
      { name: "Transfer to Current", amount: 2000.00, category: "Transfer", date: new Date(thisYear, thisMonth, 3), bankAccountId: savingsAccount.id, type: "transfer" },
      { name: "Supermarket", amount: 215.75, category: "Groceries", date: new Date(thisYear, thisMonth, 5), bankAccountId: currentAccount.id, type: "expense" },
      { name: "Petrol Station", amount: 180.00, category: "Transport", date: new Date(thisYear, thisMonth, 4), bankAccountId: currentAccount.id, type: "expense" },
      { name: "Freelance Income", amount: 3500.00, category: "Income", date: new Date(thisYear, thisMonth, 7), bankAccountId: currentAccount.id, type: "income" },
    ];

    let count = 0;
    for (const txn of txns) {
      await db.transaction.create({
        data: {
          name: txn.name,
          amount: txn.amount,
          category: txn.category,
          date: txn.date,
          installments: 1,
          type: txn.type,
          ...(txn.creditCardId ? { creditCardId: txn.creditCardId } : {}),
          ...(txn.bankAccountId ? { bankAccountId: txn.bankAccountId } : {}),
        },
      });
      count++;
      process.stdout.write(`\r  ✓ ${count}/${txns.length} transactions created`);
    }
    console.log(`\n  Done!`);

    // Update bank account balances
    await db.bank_account.update({
      where: { id: savingsAccount.id },
      data: { currentBalance: { decrement: 7500 + 2000 } },
    });
    await db.bank_account.update({
      where: { id: currentAccount.id },
      data: { currentBalance: { decrement: 215.75 + 180, increment: 3500 } },
    });
    // Update credit card available balances
    const visaSpend = 342.50 + 189 + 67 + 520 + 199;
    const mastercardSpend = 1250 + 450 + 95;
    await db.credit_card.update({
      where: { id: visaCard.id },
      data: { availableBalance: { decrement: visaSpend } },
    });
    await db.credit_card.update({
      where: { id: mastercardCard.id },
      data: { availableBalance: { decrement: mastercardSpend } },
    });
    console.log("  ✓ Account balances updated");
  } else {
    console.log(`  Transactions already exist (${existingTxns.length}), skipping.`);
  }

  // --- Categories ---
  const existingCats = await db.category.findMany({ where: { userId } });
  if (existingCats.length === 0) {
    console.log("\nSeeding default categories...");
    const cats = [
      { name: "Groceries", color: "#10b981", type: "expense" },
      { name: "Food & Dining", color: "#f59e0b", type: "expense" },
      { name: "Shopping", color: "#8b5cf6", type: "expense" },
      { name: "Transport", color: "#3b82f6", type: "expense" },
      { name: "Travel", color: "#06b6d4", type: "expense" },
      { name: "Utilities", color: "#64748b", type: "expense" },
      { name: "Phone & Internet", color: "#6366f1", type: "expense" },
      { name: "Health & Fitness", color: "#ec4899", type: "expense" },
      { name: "Entertainment", color: "#f97316", type: "expense" },
      { name: "Rent & Housing", color: "#ef4444", type: "expense" },
      { name: "Education", color: "#14b8a6", type: "expense" },
      { name: "Insurance", color: "#84cc16", type: "expense" },
      { name: "Transfer", color: "#a855f7", type: "transfer" },
      { name: "Income", color: "#1a9e5c", type: "income" },
      { name: "Freelance", color: "#0ea5e9", type: "income" },
    ];
    for (const cat of cats) {
      await db.category.create({ data: { ...cat, userId } });
    }
    console.log(`  ✓ ${cats.length} categories created`);
  } else {
    console.log(`  Categories already exist (${existingCats.length}), skipping.`);
  }

  console.log("\n✅ Seed complete! Refresh http://localhost:3000/dashboard");
}

main().catch(console.error).finally(() => db.$disconnect());
