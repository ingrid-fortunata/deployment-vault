import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { deploymentEnvironmentSchema } from "@/lib/validations";
import { assertProjectOwner, OwnershipError } from "@/lib/ownership";
import { encryptIfPresent, decryptIfPresent } from "@/lib/encryption";
import { badRequest, forbidden, noContent, notFound, ok, serverError, unauthorized } from "@/lib/api-response";

function decryptDeployment(dep: {
  id: string;
  environment: string;
  deploymentUrl: string | null;
  credentials: string | null;
  envFileContent: string | null;
  notes: string | null;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...dep,
    credentials: decryptIfPresent(dep.credentials),
    envFileContent: decryptIfPresent(dep.envFileContent),
    notes: decryptIfPresent(dep.notes),
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; deploymentId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId, deploymentId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const body = await req.json();
    const parsed = deploymentEnvironmentSchema.partial().safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const existing = await db.deploymentEnvironment.findUnique({ where: { id: deploymentId } });
    if (!existing || existing.projectId !== projectId) return notFound();

    const { deploymentUrl, credentials, envFileContent, notes, environment } = parsed.data;
    const updated = await db.deploymentEnvironment.update({
      where: { id: deploymentId },
      data: {
        ...(environment !== undefined && { environment }),
        ...(deploymentUrl !== undefined && { deploymentUrl: deploymentUrl || null }),
        ...(credentials !== undefined && { credentials: encryptIfPresent(credentials) }),
        ...(envFileContent !== undefined && { envFileContent: encryptIfPresent(envFileContent) }),
        ...(notes !== undefined && { notes: encryptIfPresent(notes) }),
      },
    });
    return ok(decryptDeployment(updated));
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; deploymentId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId, deploymentId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const existing = await db.deploymentEnvironment.findUnique({ where: { id: deploymentId } });
    if (!existing || existing.projectId !== projectId) return notFound();
    await db.deploymentEnvironment.delete({ where: { id: deploymentId } });
    return noContent();
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}
