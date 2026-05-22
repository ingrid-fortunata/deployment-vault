"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Server, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  deploymentEnvironmentSchema,
  type DeploymentEnvironmentInput,
} from "@/lib/validations";
import type { DeploymentEnvironment } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SecretField } from "./secret-field";
import { CopyButton } from "./copy-button";
import { EnvBadge } from "./env-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

interface Props {
  projectId: string;
  companyId: string;
}

async function fetchDeployments(
  projectId: string,
): Promise<DeploymentEnvironment[]> {
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeploymentEnvironmentInput>({
    resolver: zodResolver(deploymentEnvironmentSchema),
    defaultValues: {
      environment: "production",
      deploymentUrl: "",
      credentials: "",
      envFileContent: "",
      notes: "",
    },
  });

  const envValue = watch("environment");

  function openAdd() {
    setEditing(null);
    reset({
      environment: "production",
      deploymentUrl: "",
      credentials: "",
      envFileContent: "",
      notes: "",
    });
    setFormOpen(true);
  }
  function openEdit(d: DeploymentEnvironment) {
    setEditing(d);
    reset({
      environment: d.environment,
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
      const res = await fetch(`/api/projects/${projectId}/deployments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deployments", projectId] });
      toast.success("Environment deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const idleLabel = editing ? "Save changes" : "Add";
  const submitLabel = saveMutation.isPending ? "Saving…" : idleLabel;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer"
          onClick={openAdd}
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add environment
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && deployments?.length === 0 && (
        <div className="text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Server className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No deployment environments yet.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {deployments?.map((dep) => (
          <div
            key={dep.id}
            className="rounded-xl bg-white border border-border shadow-sm overflow-hidden"
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <EnvBadge environment={dep.environment} />
                {dep.deploymentUrl && (
                  <a
                    href={dep.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    {dep.deploymentUrl}{" "}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>
              <div className="flex gap-1">
                {dep.deploymentUrl && (
                  <CopyButton value={dep.deploymentUrl} label="URL" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={() => openEdit(dep)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={() => setDeleting(dep)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {dep.credentials && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Credentials
                  </p>
                  <SecretField
                    value={dep.credentials}
                    label="Credentials"
                    multiline
                  />
                </div>
              )}
              {dep.envFileContent && (
                <>
                  {dep.credentials && <Separator />}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      .env file
                    </p>
                    <SecretField
                      value={dep.envFileContent}
                      label="Env file"
                      multiline
                    />
                  </div>
                </>
              )}
              {dep.notes && (
                <>
                  {(dep.credentials || dep.envFileContent) && <Separator />}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                      Notes
                    </p>
                    <SecretField value={dep.notes} label="Notes" multiline />
                  </div>
                </>
              )}
              {!dep.credentials && !dep.envFileContent && !dep.notes && (
                <p className="text-sm text-muted-foreground italic">
                  No details stored.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit environment" : "Add environment"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
          >
            <div className="space-y-1.5">
              <Label>Environment *</Label>
              <Select
                value={envValue}
                onValueChange={(v) =>
                  setValue(
                    "environment",
                    v as "production" | "staging" | "development",
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENV_OPTIONS.map((e) => (
                    <SelectItem key={e} value={e} className="capitalize">
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.environment && (
                <p className="text-xs text-destructive">
                  {errors.environment.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Deployment URL</Label>
              <Input
                placeholder="https://app.example.com"
                {...register("deploymentUrl")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Credentials{" "}
                <span className="text-xs text-amber-600 font-normal">
                  (encrypted)
                </span>
              </Label>
              <Textarea
                className="font-mono text-xs resize-none"
                rows={4}
                placeholder={
                  "Login: admin@example.com\nPassword: secret123\nAdmin URL: /admin"
                }
                {...register("credentials")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                .env file content{" "}
                <span className="text-xs text-amber-600 font-normal">
                  (encrypted)
                </span>
              </Label>
              <Textarea
                className="font-mono text-xs resize-none"
                rows={5}
                placeholder={"DATABASE_URL=...\nSECRET_KEY=..."}
                {...register("envFileContent")}
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                Notes{" "}
                <span className="text-xs text-amber-600 font-normal">
                  (encrypted)
                </span>
              </Label>
              <Textarea
                className="resize-none"
                rows={3}
                placeholder="Additional deployment notes…"
                {...register("notes")}
              />
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setFormOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                disabled={saveMutation.isPending}
              >
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => { if (!open) setDeleting(null); }}
        title="Delete environment?"
        description={
          <>
            Delete <strong className="capitalize">{deleting?.environment}</strong> environment?
            All sensitive data will be lost.
          </>
        }
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        isPending={deleteMutation.isPending}
        confirmLabel="Delete environment"
      />
    </div>
  );
}
