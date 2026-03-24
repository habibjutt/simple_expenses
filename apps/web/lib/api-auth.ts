import { auth } from "@/lib/auth";

export async function getApiUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user ?? null;
}

export const api = {
  unauthorized: () =>
    Response.json({ error: "Unauthorized" }, { status: 401 }),
  notFound: (message = "Not found") =>
    Response.json({ error: message }, { status: 404 }),
  badRequest: (message: string) =>
    Response.json({ error: message }, { status: 400 }),
  ok: (data: unknown) => Response.json(data),
  created: (data: unknown) => Response.json(data, { status: 201 }),
  noContent: () => new Response(null, { status: 204 }),
  internalError: (message = "Internal server error") =>
    Response.json({ error: message }, { status: 500 }),
};
