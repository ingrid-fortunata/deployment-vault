import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Building2, FolderOpen, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [companyCount, projectCount, deploymentCount] = await Promise.all([
    db.company.count({ where: { userId: session.userId } }),
    db.project.count({ where: { company: { userId: session.userId } } }),
    db.deploymentEnvironment.count({
      where: { project: { company: { userId: session.userId } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session.name.split(" ")[0]}
        </h1>
        <p className="text-slate-400 mt-1">
          Here&apos;s an overview of your deployment vault.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Companies</CardTitle>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{companyCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Projects</CardTitle>
            <FolderOpen className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{projectCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Environments</CardTitle>
            <Server className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{deploymentCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="py-12 text-center">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            Select a company from the sidebar to get started.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
