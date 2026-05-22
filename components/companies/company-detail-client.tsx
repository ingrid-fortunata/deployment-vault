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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {company.name}
            </h1>
            {company.description && (
              <p className="text-muted-foreground text-sm mt-0.5">
                {company.description}
              </p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mt-1"
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

      {/* Projects section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              Projects
            </h2>
            {projects && (
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground text-xs"
              >
                {projects.length}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setAddProjectOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add project
          </Button>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && projects?.length === 0 && (
          <Card className="bg-white border-border shadow-sm">
            <CardContent className="py-14 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No projects yet.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddProjectOpen(true)}
                className="cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
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

      <AddCompanyDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        company={company}
      />
      <DeleteCompanyDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        company={company}
      />
      <AddProjectDialog
        open={addProjectOpen}
        onOpenChange={setAddProjectOpen}
        companyId={company.id}
      />
    </div>
  );
}
