export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  title: string;
  url: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export type EnvironmentType = "production" | "staging" | "development";

export interface DeploymentEnvironment {
  id: string;
  environment: EnvironmentType;
  deploymentUrl: string | null;
  credentials: string | null;
  envFileContent: string | null;
  notes: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendDocumentation {
  id: string;
  title: string;
  url: string;
  description: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = "link" | "note" | "credential" | "document";

export interface ProjectDocument {
  id: string;
  title: string;
  type: DocumentType;
  value: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}
