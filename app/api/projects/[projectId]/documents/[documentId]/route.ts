import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectDocumentSchema } from "@/lib/validations";
import { assertProjectOwner, OwnershipError } from "@/lib/ownership";
import { encryptIfPresent, decryptIfPresent } from "@/lib/encryption";
import { badRequest, forbidden, noContent, notFound, ok, serverError, unauthorized } from "@/lib/api-response";

const SENSITIVE_TYPES = ["credential", "note"];

function decryptDoc(doc: { id: string; title: string; type: string; value: string | null; projectId: string; createdAt: Date; updatedAt: Date }) {
  return {
    ...doc,
    value: SENSITIVE_TYPES.includes(doc.type) ? decryptIfPresent(doc.value) : doc.value,
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId, documentId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const body = await req.json();
    const parsed = projectDocumentSchema.partial().safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
    const existing = await db.projectDocument.findUnique({ where: { id: documentId } });
    if (!existing || existing.projectId !== projectId) return notFound();

    const newType = parsed.data.type ?? existing.type;
    const shouldEncrypt = SENSITIVE_TYPES.includes(newType);

    const updated = await db.projectDocument.update({
      where: { id: documentId },
      data: {
        ...(parsed.data.title !== undefined && { title: parsed.data.title }),
        ...(parsed.data.type !== undefined && { type: parsed.data.type }),
        ...(parsed.data.value !== undefined && {
          value: shouldEncrypt ? encryptIfPresent(parsed.data.value) : (parsed.data.value ?? null),
        }),
      },
    });
    return ok(decryptDoc(updated));
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; documentId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId, documentId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const existing = await db.projectDocument.findUnique({ where: { id: documentId } });
    if (!existing || existing.projectId !== projectId) return notFound();
    await db.projectDocument.delete({ where: { id: documentId } });
    return noContent();
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}
