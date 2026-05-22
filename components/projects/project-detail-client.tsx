"use client";

import { useState } from "react";
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

export function ProjectDetailClient({ project, companyId, companyName }: Readonly<Props>) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-400">
        <Link href={`/dashboard/companies/${companyId}`} className="hover:text-white transition-colors">
          {companyName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            {project.description && (
              <p className="text-slate-400 text-sm mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="border-red-800 text-red-400 hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
            Overview
          </TabsTrigger>
          <TabsTrigger value="repositories" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
            Repositories
          </TabsTrigger>
          <TabsTrigger value="deployment" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
            Deployment
          </TabsTrigger>
          <TabsTrigger value="backend-docs" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
            Backend Docs
          </TabsTrigger>
          <TabsTrigger value="other-info" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400">
            Other Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Repositories", count: project._count?.repositories ?? 0, color: "text-blue-400" },
              { label: "Environments", count: project._count?.deployments ?? 0, color: "text-amber-400" },
              { label: "Backend Docs", count: project._count?.backendDocs ?? 0, color: "text-emerald-400" },
              { label: "Documents", count: project._count?.documents ?? 0, color: "text-purple-400" },
            ].map(({ label, count, color }) => (
              <div key={label} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <p className="text-xs text-slate-400">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{count}</p>
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
