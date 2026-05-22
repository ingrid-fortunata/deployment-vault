import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { backendDocumentationSchema } from "@/lib/validations";
import { assertProjectOwner, OwnershipError } from "@/lib/ownership";
import { badRequest, forbidden, noContent, notFound, ok, serverError, unauthorized } from "@/lib/api-response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; docId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId, docId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const body = await req.json();
    const parsed = backendDocumentationSchema.partial().safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
    const existing = await db.backendDocumentation.findUnique({ where: { id: docId } });
    if (!existing || existing.projectId !== projectId) return notFound();
    const updated = await db.backendDocumentation.update({ where: { id: docId }, data: parsed.data });
    return ok(updated);
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; docId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId, docId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const existing = await db.backendDocumentation.findUnique({ where: { id: docId } });
    if (!existing || existing.projectId !== projectId) return notFound();
    await db.backendDocumentation.delete({ where: { id: docId } });
    return noContent();
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}
