import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validations";
import { assertCompanyOwner, OwnershipError } from "@/lib/ownership";
import {
  badRequest,
  created,
  forbidden,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { companyId } = await params;
  try {
    await assertCompanyOwner(companyId, session.userId);
    const projects = await db.project.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            repositories: true,
            deployments: true,
            backendDocs: true,
            documents: true,
          },
        },
      },
    });
    return ok(projects);
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { companyId } = await params;
  try {
    await assertCompanyOwner(companyId, session.userId);
    const body = await req.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const company = await db.company.findUnique({ where: { id: companyId } });
    if (!company) return notFound("Company not found");

    const project = await db.project.create({
      data: { ...parsed.data, companyId },
    });
    return created(project);
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}
