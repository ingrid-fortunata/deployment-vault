import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/types";
import { ProjectInput } from "@/lib/validations";

export function useCompanyProjects(companyId: string) {
  return useQuery<Project[]>({
    queryKey: ["projects", companyId],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/projects`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return (await res.json()).data;
    },
    enabled: !!companyId,
  });
}

export function useCreateProject(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProjectInput) => {
      const res = await fetch(`/api/companies/${companyId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return (await res.json()).data as Project;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", companyId] }),
  });
}

export function useDeleteProject(companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/companies/${companyId}/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects", companyId] }),
  });
}
