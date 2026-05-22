import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { companySchema } from "@/lib/validations";
import {
  badRequest,
  forbidden,
  noContent,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api-response";

async function getCompanyForUser(companyId: string, userId: string) {
  const company = await db.company.findUnique({ where: { id: companyId } });
  if (!company) return null;
  if (company.userId !== userId) return "forbidden" as const;
  return company;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { companyId } = await params;
  try {
    const company = await getCompanyForUser(companyId, session.userId);
    if (!company) return notFound("Company not found");
    if (company === "forbidden") return forbidden();
    return ok(company);
  } catch {
    return serverError();
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { companyId } = await params;
  try {
    const body = await req.json();
    const parsed = companySchema.partial().safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const existing = await getCompanyForUser(companyId, session.userId);
    if (!existing) return notFound("Company not found");
    if (existing === "forbidden") return forbidden();

    const updated = await db.company.update({
      where: { id: companyId },
      data: {
        ...parsed.data,
        website: parsed.data.website === "" ? null : parsed.data.website,
      },
    });
    return ok(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { companyId } = await params;
  try {
    const existing = await getCompanyForUser(companyId, session.userId);
    if (!existing) return notFound("Company not found");
    if (existing === "forbidden") return forbidden();

    await db.company.delete({ where: { id: companyId } });
    return noContent();
  } catch {
    return serverError();
  }
}
