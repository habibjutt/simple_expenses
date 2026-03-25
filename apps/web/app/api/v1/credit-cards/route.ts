import { getApiUser, api } from "@/lib/api-auth";
import { sanitizeString } from "@/lib/sanitize";
import { db } from "@/lib/db";

// GET /api/v1/credit-cards
export async function GET(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  const cards = await db.credit_card.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return api.ok(cards);
}

// POST /api/v1/credit-cards
export async function POST(request: Request) {
  const user = await getApiUser(request);
  if (!user) return api.unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return api.badRequest("Invalid JSON body");
  }

  const { name, billGenerationDate, paymentDate, cardLimit } = body as Record<
    string,
    unknown
  >;

  if (
    !name ||
    billGenerationDate == null ||
    paymentDate == null ||
    cardLimit == null
  )
    return api.badRequest(
      "name, billGenerationDate, paymentDate, and cardLimit are required",
    );

  const bgd = Number(billGenerationDate);
  const pd = Number(paymentDate);
  const cl = Number(cardLimit);

  if (isNaN(bgd) || bgd < 1 || bgd > 31)
    return api.badRequest("billGenerationDate must be between 1 and 31");
  if (isNaN(pd) || pd < 1 || pd > 31)
    return api.badRequest("paymentDate must be between 1 and 31");
  if (isNaN(cl) || cl <= 0)
    return api.badRequest("cardLimit must be greater than 0");

  const card = await db.credit_card.create({
    data: {
      name: sanitizeString(String(name)),
      billGenerationDate: bgd,
      paymentDate: pd,
      cardLimit: cl,
      availableBalance: cl,
      userId: user.id,
    },
  });

  return api.created(card);
}
