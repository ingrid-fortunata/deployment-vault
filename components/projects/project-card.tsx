"use client";

import Link from "next/link";
import { FolderOpen, GitBranch, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

interface ProjectWithCount extends Project {
  _count?: {
    repositories: number;
    deployments: number;
    backendDocs: number;
    documents: number;
  };
}

interface Props {
  project: ProjectWithCount;
  companyId: string;
}

export function ProjectCard({ project, companyId }: Readonly<Props>) {
  return (
    <Link href={`/dashboard/companies/${companyId}/projects/${project.id}`}>
      <Card className="bg-slate-800 border-slate-700 hover:border-indigo-600/50 hover:bg-slate-750 transition-all cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600/30 transition-colors">
              <FolderOpen className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold text-white truncate">
                {project.name}
              </CardTitle>
              {project.description && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        {project._count && (
          <CardContent className="pt-0">
            <div className="flex gap-2 flex-wrap">
              {project._count.repositories > 0 && (
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                  <GitBranch className="w-3 h-3 mr-1" />
                  {project._count.repositories} repo{project._count.repositories !== 1 ? "s" : ""}
                </Badge>
              )}
              {project._count.deployments > 0 && (
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                  <Server className="w-3 h-3 mr-1" />
                  {project._count.deployments} env{project._count.deployments !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
