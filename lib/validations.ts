import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

export const repositorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid repository URL"),
});

export const deploymentEnvironmentSchema = z.object({
  environment: z.enum(["production", "staging", "development"]),
  deploymentUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  credentials: z.string().optional(),
  envFileContent: z.string().optional(),
  notes: z.string().optional(),
});

export const backendDocumentationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional(),
});

export const projectDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["link", "note", "credential", "document"]),
  value: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type RepositoryInput = z.infer<typeof repositorySchema>;
export type DeploymentEnvironmentInput = z.infer<typeof deploymentEnvironmentSchema>;
export type BackendDocumentationInput = z.infer<typeof backendDocumentationSchema>;
export type ProjectDocumentInput = z.infer<typeof projectDocumentSchema>;
