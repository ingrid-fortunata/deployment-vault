"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Server, Pencil, Trash2, ExternalLink } from "lucide-react";
import { deploymentEnvironmentSchema, type DeploymentEnvironmentInput } from "@/lib/validations";
import type { DeploymentEnvironment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SecretField } from "./secret-field";
import { CopyButton } from "./copy-button";
import { EnvBadge } from "./env-badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Props { projectId: string; companyId: string; }

async function fetchDeployments(projectId: string): Promise<DeploymentEnvironment[]> {
  const res = await fetch(`/api/projects/${projectId}/deployments`);
  if (!res.ok) throw new Error("Failed");
  return (await res.json()).data;
}

const ENV_OPTIONS = ["production", "staging", "development"] as const;

export function DeploymentTab({ projectId }: Readonly<Props>) {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DeploymentEnvironment | null>(null);
  const [deleting, setDeleting] = useState<DeploymentEnvironment | null>(null);

  const { data: deployments, isLoading } = useQuery({
    queryKey: ["deployments", projectId],
    queryFn: () => fetchDeployments(projectId),
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DeploymentEnvironmentInput>({
    resolver: zodResolver(deploymentEnvironmentSchema),
    defaultValues: { environment: "production", deploymentUrl: "", credentials: "", envFileContent: "", notes: "" },
  });

  const envValue = watch("environment");

  function openAdd() {
    setEditing(null);
    reset({ environment: "production", deploymentUrl: "", credentials: "", envFileContent: "", notes: "" });
    setFormOpen(true);
  }
  function openEdit(d: DeploymentEnvironment) {
    setEditing(d);
    reset({
      environment: d.environment as "production" | "staging" | "development",
      deploymentUrl: d.deploymentUrl ?? "",
      credentials: d.credentials ?? "",
      envFileContent: d.envFileContent ?? "",
      notes: d.notes ?? "",
    });
    setFormOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (data: DeploymentEnvironmentInput) => {
      const url = editing
        ? `/api/projects/${projectId}/deployments/${editing.id}`
        : `/api/projects/${projectId}/deployments`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deployments", projectId] });
      toast.success(editing ? "Environment updated" : "Environment added");
      setFormOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${projectId}/deployments/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deployments", projectId] });
      toast.success("Environment deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add environment
        </Button>
      </div>

      {isLoading && <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-32 bg-slate-800" />)}</div>}

      {!isLoading && deployments?.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Server className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p>No deployment environments yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {deployments?.map((dep) => (
          <div key={dep.id} className="rounded-lg bg-slate-800 border border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <EnvBadge environment={dep.environment} />
                {dep.deploymentUrl && (
                  <a href={dep.deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    {dep.deploymentUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex gap-1">
                {dep.deploymentUrl && <CopyButton value={dep.deploymentUrl} label="URL" />}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => openEdit(dep)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setDeleting(dep)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {dep.credentials && (
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Credentials</p>
                  <SecretField value={dep.credentials} label="Credentials" multiline />
                </div>
              )}
              {dep.envFileContent && (
                <>
                  {dep.credentials && <Separator className="bg-slate-700" />}
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">.env file</p>
                    <SecretField value={dep.envFileContent} label="Env file" multiline />
                  </div>
                </>
              )}
              {dep.notes && (
                <>
                  {(dep.credentials || dep.envFileContent) && <Separator className="bg-slate-700" />}
                  <div>
                    <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Notes</p>
                    <SecretField value={dep.notes} label="Notes" multiline />
                  </div>
                </>
              )}
              {!dep.credentials && !dep.envFileContent && !dep.notes && (
                <p className="text-sm text-slate-500 italic">No details stored.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit environment" : "Add environment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-1">
              <Label className="text-slate-300">Environment *</Label>
              <Select value={envValue} onValueChange={(v) => setValue("environment", v as "production" | "staging" | "development")}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {ENV_OPTIONS.map(e => (
                    <SelectItem key={e} value={e} className="text-white capitalize">{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.environment && <p className="text-xs text-red-400">{errors.environment.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Deployment URL</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="https://app.example.com" {...register("deploymentUrl")} />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Credentials <span className="text-xs text-amber-400">(encrypted)</span></Label>
              <Textarea className="bg-slate-700 border-slate-600 text-white font-mono text-xs resize-none" rows={4} placeholder="Login: admin@example.com&#10;Password: secret123&#10;Admin URL: /admin" {...register("credentials")} />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">.env file content <span className="text-xs text-amber-400">(encrypted)</span></Label>
              <Textarea className="bg-slate-700 border-slate-600 text-white font-mono text-xs resize-none" rows={5} placeholder="DATABASE_URL=...&#10;SECRET_KEY=..." {...register("envFileContent")} />
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Notes <span className="text-xs text-amber-400">(encrypted)</span></Label>
              <Textarea className="bg-slate-700 border-slate-600 text-white resize-none" rows={3} placeholder="Additional deployment notes..." {...register("notes")} />
            </div>
            <DialogFooter>
              <Button variant="ghost" type="button" onClick={() => setFormOpen(false)} className="text-slate-400">Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : editing ? "Save changes" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {deleting && (
        <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete environment?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Delete <strong className="text-white capitalize">{deleting.environment}</strong> environment? All sensitive data will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 border-slate-600 text-white">Cancel</AlertDialogCancel>
              <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
