"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Globe, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AddCompanyDialog } from "./add-company-dialog";
import { DeleteCompanyDialog } from "./delete-company-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import type { Company, Project } from "@/types";

interface Props {
  company: Company & { _count?: { projects: number } };
}

async function fetchProjects(companyId: string): Promise<Project[]> {
  const res = await fetch(`/api/companies/${companyId}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  const json = await res.json();
  return json.data;
}

export function CompanyDetailClient({ company }: Readonly<Props>) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", company.id],
    queryFn: () => fetchProjects(company.id),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{company.name}</h1>
            {company.description && (
              <p className="text-slate-400 text-sm mt-0.5">{company.description}</p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 mt-1"
              >
                <Globe className="w-3 h-3" />
                {company.website}
              </a>
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

      {/* Projects section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Projects</h2>
            {projects && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                {projects.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setAddProjectOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add project
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 bg-slate-800" />
            ))}
          </div>
        )}

        {!isLoading && projects?.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">No projects yet.</p>
              <Button
                variant="ghost"
                className="mt-3 text-indigo-400 hover:text-indigo-300"
                onClick={() => setAddProjectOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add your first project
              </Button>
            </CardContent>
          </Card>
        )}

        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                companyId={company.id}
              />
            ))}
          </div>
        )}
      </div>

      <AddCompanyDialog open={editOpen} onOpenChange={setEditOpen} company={company} />
      <DeleteCompanyDialog open={deleteOpen} onOpenChange={setDeleteOpen} company={company} />
      <AddProjectDialog
        open={addProjectOpen}
        onOpenChange={setAddProjectOpen}
        companyId={company.id}
      />
    </div>
  );
}
