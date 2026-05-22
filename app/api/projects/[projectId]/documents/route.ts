import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectDocumentSchema } from "@/lib/validations";
import { assertProjectOwner, OwnershipError } from "@/lib/ownership";
import { encryptIfPresent, decryptIfPresent } from "@/lib/encryption";
import { badRequest, created, forbidden, ok, serverError, unauthorized } from "@/lib/api-response";

const SENSITIVE_TYPES = ["credential", "note"];

function decryptDoc(doc: { id: string; title: string; type: string; value: string | null; projectId: string; createdAt: Date; updatedAt: Date }) {
  return {
    ...doc,
    value: SENSITIVE_TYPES.includes(doc.type) ? decryptIfPresent(doc.value) : doc.value,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const docs = await db.projectDocument.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
    return ok(docs.map(decryptDoc));
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
    const parsed = projectDocumentSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const { title, type, value } = parsed.data;
    const shouldEncrypt = SENSITIVE_TYPES.includes(type);
    const doc = await db.projectDocument.create({
      data: {
        title,
        type,
        value: shouldEncrypt ? encryptIfPresent(value) : (value ?? null),
        projectId,
      },
    });
    return created(decryptDoc(doc));
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}
