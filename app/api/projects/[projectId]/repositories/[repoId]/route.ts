import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { repositorySchema } from "@/lib/validations";
import { assertProjectOwner, OwnershipError } from "@/lib/ownership";
import { badRequest, forbidden, noContent, notFound, ok, serverError, unauthorized } from "@/lib/api-response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; repoId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId, repoId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const body = await req.json();
    const parsed = repositorySchema.partial().safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
    const repo = await db.repository.findUnique({ where: { id: repoId } });
    if (!repo || repo.projectId !== projectId) return notFound();
    const updated = await db.repository.update({ where: { id: repoId }, data: parsed.data });
    return ok(updated);
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; repoId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId, repoId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const repo = await db.repository.findUnique({ where: { id: repoId } });
    if (!repo || repo.projectId !== projectId) return notFound();
    await db.repository.delete({ where: { id: repoId } });
    return noContent();
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}
