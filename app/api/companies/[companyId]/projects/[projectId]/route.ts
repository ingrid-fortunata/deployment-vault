import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSchema } from "@/lib/validations";
import { assertProjectOwner, OwnershipError } from "@/lib/ownership";
import {
  badRequest,
  forbidden,
  noContent,
  notFound,
  ok,
  serverError,
  unauthorized,
} from "@/lib/api-response";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { projectId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        _count: {
          select: { repositories: true, deployments: true, backendDocs: true, documents: true },
        },
      },
    });
    if (!project) return notFound();
    return ok(project);
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { projectId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    const body = await req.json();
    const parsed = projectSchema.partial().safeParse(body);
    if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

    const updated = await db.project.update({
      where: { id: projectId },
      data: parsed.data,
    });
    return ok(updated);
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string; projectId: string }> }
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { projectId } = await params;
  try {
    await assertProjectOwner(projectId, session.userId);
    await db.project.delete({ where: { id: projectId } });
    return noContent();
  } catch (err) {
    if (err instanceof OwnershipError) return forbidden();
    return serverError();
  }
}
