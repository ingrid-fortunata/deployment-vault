import { Badge } from "@/components/ui/badge";
import type { EnvironmentType } from "@/types";

const CONFIG: Record<EnvironmentType, { label: string; className: string }> = {
  production: { label: "Production", className: "bg-red-50 text-red-700 border-red-200" },
  staging:    { label: "Staging",    className: "bg-amber-50 text-amber-700 border-amber-200" },
  development:{ label: "Development",className: "bg-blue-50 text-blue-700 border-blue-200" },
};

export function EnvBadge({ environment }: Readonly<{ environment: string }>) {
  const cfg = CONFIG[environment as EnvironmentType] ?? {
    label: environment,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}
