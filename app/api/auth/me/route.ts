import { getSession } from "@/lib/auth";
import { ok, unauthorized } from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  return ok({ userId: session.userId, email: session.email, name: session.name });
}
