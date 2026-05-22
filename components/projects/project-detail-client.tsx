"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronRight, FolderOpen, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddProjectDialog } from "./add-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { RepositoriesTab } from "@/components/vault/repositories-tab";
import { DeploymentTab } from "@/components/vault/deployment-tab";
import { BackendDocsTab } from "@/components/vault/backend-docs-tab";
import { OtherDocsTab } from "@/components/vault/other-docs-tab";
import type { Project } from "@/types";

interface ProjectWithCompany extends Project {
  company: { id: string; name: string };
  _count?: {
    repositories: number;
    deployments: number;
    backendDocs: number;
    documents: number;
  };
}

interface Props {
  project: ProjectWithCompany;
  companyId: string;
  companyName: string;
}

async function fetchList(url: string): Promise<unknown[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed");
  return (await res.json()).data as unknown[];
}

export function ProjectDetailClient({
  project,
  companyId,
  companyName,
}: Readonly<Props>) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: repoCount } = useQuery({
    queryKey: ["repos", project.id],
    queryFn: () => fetchList(`/api/projects/${project.id}/repositories`),
    select: (items) => items.length,
  });
  const { data: deployCount } = useQuery({
    queryKey: ["deployments", project.id],
    queryFn: () => fetchList(`/api/projects/${project.id}/deployments`),
    select: (items) => items.length,
  });
  const { data: backendDocCount } = useQuery({
    queryKey: ["backend-docs", project.id],
    queryFn: () => fetchList(`/api/projects/${project.id}/backend-docs`),
    select: (items) => items.length,
  });
  const { data: documentCount } = useQuery({
    queryKey: ["documents", project.id],
    queryFn: () => fetchList(`/api/projects/${project.id}/documents`),
    select: (items) => items.length,
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href={`/dashboard/companies/${companyId}`}
          className="hover:text-foreground transition-colors"
        >
          {companyName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <FolderOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-muted-foreground text-sm mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="cursor-pointer"
          >
            <Pencil className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/60 border border-border p-1 h-auto gap-0.5">
          {[
            { value: "overview", label: "Overview" },
            { value: "repositories", label: "Repositories" },
            { value: "deployment", label: "Deployment" },
            { value: "backend-docs", label: "Backend Docs" },
            { value: "other-info", label: "Other Info" },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="text-muted-foreground data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md text-sm cursor-pointer"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Repositories", count: repoCount ?? project._count?.repositories ?? 0, color: "text-blue-600" },
              { label: "Environments", count: deployCount ?? project._count?.deployments ?? 0, color: "text-amber-600" },
              { label: "Backend Docs", count: backendDocCount ?? project._count?.backendDocs ?? 0, color: "text-emerald-600" },
              { label: "Documents", count: documentCount ?? project._count?.documents ?? 0, color: "text-violet-600" },
            ].map(({ label, count, color }) => (
              <div
                key={label}
                className="bg-white border border-border rounded-xl p-4 shadow-sm"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <p className={`text-3xl font-bold mt-2 ${color}`}>{count}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="repositories" className="mt-6">
          <RepositoriesTab projectId={project.id} companyId={companyId} />
        </TabsContent>

        <TabsContent value="deployment" className="mt-6">
          <DeploymentTab projectId={project.id} companyId={companyId} />
        </TabsContent>

        <TabsContent value="backend-docs" className="mt-6">
          <BackendDocsTab projectId={project.id} companyId={companyId} />
        </TabsContent>

        <TabsContent value="other-info" className="mt-6">
          <OtherDocsTab projectId={project.id} companyId={companyId} />
        </TabsContent>
      </Tabs>

      <AddProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        companyId={companyId}
        project={project}
      />
      <DeleteProjectDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        project={project}
        companyId={companyId}
      />
    </div>
  );
}
