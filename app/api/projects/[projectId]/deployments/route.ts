import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { deploymentEnvironmentSchema } from "@/lib/validations";
import { assertProjectOwner, OwnershipError } from "@/lib/ownership";
import { encryptIfPresent, decryptIfPresent } from "@/lib/encryption";
import { badRequest, created, forbidden, ok, serverError, unauthorized } from "@/lib/api-response";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();
  const { projectId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const deployments = await db.deploymentEnvironment.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
    return ok(deployments.map(decryptDeployment));
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
    const parsed = deploymentEnvironmentSchema.safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const { deploymentUrl, credentials, envFileContent, notes, environment } = parsed.data;
    const deployment = await db.deploymentEnvironment.create({
      data: {
        environment,
        deploymentUrl: deploymentUrl || null,
        credentials: encryptIfPresent(credentials),
        envFileContent: encryptIfPresent(envFileContent),
        notes: encryptIfPresent(notes),
        projectId,
      },
    });
    return created(decryptDeployment(deployment));
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}
