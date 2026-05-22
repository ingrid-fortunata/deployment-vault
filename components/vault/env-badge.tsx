import { Badge } from "@/components/ui/badge";
import type { EnvironmentType } from "@/types";

const CONFIG: Record<EnvironmentType, { label: string; className: string }> = {
  production: { label: "Production", className: "bg-red-600/20 text-red-300 border-red-600/30" },
  staging: { label: "Staging", className: "bg-amber-600/20 text-amber-300 border-amber-600/30" },
  development: { label: "Development", className: "bg-blue-600/20 text-blue-300 border-blue-600/30" },
};

export function EnvBadge({ environment }: Readonly<{ environment: string }>) {
  const cfg = CONFIG[environment as EnvironmentType] ?? {
    label: environment,
    className: "bg-slate-700 text-slate-300",
  };
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}
