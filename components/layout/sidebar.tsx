"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, Plus, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Company } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddCompanyDialog } from "@/components/companies/add-company-dialog";
import { useState } from "react";

async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch("/api/companies");
  if (!res.ok) throw new Error("Failed to fetch companies");
  const json = await res.json();
  return json.data;
}

export function Sidebar() {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-700/50">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white text-sm">Deployment Vault</span>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Companies
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-700"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-1 px-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full bg-slate-700" />
              ))}
            </div>
          )}

          {!isLoading && companies?.length === 0 && (
            <div className="px-2 py-4 text-center">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No companies yet</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-indigo-400 hover:text-indigo-300 text-xs h-7"
                onClick={() => setAddOpen(true)}
              >
                Add your first company
              </Button>
            </div>
          )}

          {companies?.map((company) => {
            const href = `/dashboard/companies/${company.id}`;
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={company.id}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors group",
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{company.name}</span>
                <ChevronRight className={cn("w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity", isActive && "opacity-100")} />
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <AddCompanyDialog open={addOpen} onOpenChange={setAddOpen} />
    </aside>
  );
}
