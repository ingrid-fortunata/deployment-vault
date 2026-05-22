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
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
          <Lock className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-foreground text-sm tracking-tight">
          Deployment Vault
        </span>
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="px-3">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Companies
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-1 px-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full bg-muted" />
              ))}
            </div>
          )}

          {!isLoading && companies?.length === 0 && (
            <div className="px-2 py-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                No companies yet
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs h-7 cursor-pointer"
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
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors group",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                <Building2
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-indigo-600" : "",
                  )}
                />
                <span className="flex-1 truncate">{company.name}</span>
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 transition-opacity",
                    isActive
                      ? "opacity-60"
                      : "opacity-0 group-hover:opacity-40",
                  )}
                />
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      <AddCompanyDialog open={addOpen} onOpenChange={setAddOpen} />
    </aside>
  );
}
