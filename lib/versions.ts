export interface Version {
  version: string
  title: string
  description?: string
}

export const VERSIONS: Version[] = [
  {
    version: "1.0",
    title: "Initial design & functionality",
    description:
      "Auth, companies, projects, credentials, env files, backend docs, and other documents.",
  },
]
