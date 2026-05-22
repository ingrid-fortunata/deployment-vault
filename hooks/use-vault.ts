import { useQuery } from "@tanstack/react-query";
import type {
  Repository, DeploymentEnvironment, BackendDocumentation, ProjectDocument,
} from "@/types";

// Repositories
export function useRepositories(projectId: string) {
  return useQuery<Repository[]>({
    queryKey: ["repos", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/repositories`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
  });
}

// Deployments
export function useDeployments(projectId: string) {
  return useQuery<DeploymentEnvironment[]>({
    queryKey: ["deployments", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/deployments`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
  });
}

// Backend docs
export function useBackendDocs(projectId: string) {
  return useQuery<BackendDocumentation[]>({
    queryKey: ["backend-docs", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/backend-docs`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
  });
}

// Project documents
export function useProjectDocuments(projectId: string) {
  return useQuery<ProjectDocument[]>({
    queryKey: ["documents", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/documents`);
      if (!res.ok) throw new Error("Failed");
      return (await res.json()).data;
    },
  });
}
