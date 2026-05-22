import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { companySchema } from "@/lib/validations";
import {
  badRequest,
  created,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api-response";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const companies = await db.company.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
    });
    return ok(companies);
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const parsed = companySchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const company = await db.company.create({
      data: {
        ...parsed.data,
        website: parsed.data.website || null,
        userId: session.userId,
      },
    });
    return created(company);
  } catch {
    return serverError();
  }
}
