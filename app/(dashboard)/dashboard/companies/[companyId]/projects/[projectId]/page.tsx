import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectDetailClient } from "@/components/projects/project-detail-client";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ companyId: string; projectId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { companyId, projectId } = await params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      company: true,
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

  if (!project || project.company.userId !== session.userId || project.companyId !== companyId) {
    notFound();
  }

  const serialized = JSON.parse(JSON.stringify(project));
  return (
    <ProjectDetailClient
      project={serialized}
      companyId={companyId}
      companyName={project.company.name}
    />
  );
}
