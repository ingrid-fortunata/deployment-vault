import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { repositorySchema } from "@/lib/validations";
import { assertProjectOwner, OwnershipError } from "@/lib/ownership";
import { badRequest, created, forbidden, ok, serverError, unauthorized } from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const repos = await db.repository.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
    return ok(repos);
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const body = await req.json();
    const parsed = repositorySchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
    const repo = await db.repository.create({ data: { ...parsed.data, projectId } });
    return created(repo);
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}
