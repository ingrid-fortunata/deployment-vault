import { db } from "./db";

export async function assertCompanyOwner(
  companyId: string,
  userId: string
): Promise<void> {
  const company = await db.company.findUnique({ where: { id: companyId } });
  if (!company || company.userId !== userId) {
    throw new OwnershipError();
  }
}

export async function assertProjectOwner(
  projectId: string,
  userId: string
): Promise<void> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { company: true },
  });
  if (!project || project.company.userId !== userId) {
    throw new OwnershipError();
  }
}

export class OwnershipError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "OwnershipError";
  }
}
