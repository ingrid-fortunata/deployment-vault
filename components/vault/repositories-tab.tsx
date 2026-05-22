"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, GitBranch, Pencil, Trash2, ExternalLink } from "lucide-react";
import { repositorySchema, type RepositoryInput } from "@/lib/validations";
import type { Repository } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "./copy-button";
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

async function fetchRepos(projectId: string): Promise<Repository[]> {
  const res = await fetch(`/api/projects/${projectId}/repositories`);
  if (!res.ok) throw new Error("Failed to fetch");
  return (await res.json()).data;
}

export function RepositoriesTab({ projectId }: Readonly<Props>) {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Repository | null>(null);
  const [deleting, setDeleting] = useState<Repository | null>(null);

  const { data: repos, isLoading } = useQuery({
    queryKey: ["repos", projectId],
    queryFn: () => fetchRepos(projectId),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RepositoryInput>({
    resolver: zodResolver(repositorySchema),
    values: editing
      ? { title: editing.title, url: editing.url }
      : { title: "", url: "" },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: RepositoryInput) => {
      const url = editing
        ? `/api/projects/${projectId}/repositories/${editing.id}`
        : `/api/projects/${projectId}/repositories`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repos", projectId] });
      toast.success(editing ? "Repository updated" : "Repository added");
      setFormOpen(false);
      setEditing(null);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${projectId}/repositories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repos", projectId] });
      toast.success("Repository deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  function openAdd() {
    setEditing(null);
    reset({ title: "", url: "" });
    setFormOpen(true);
  }
  function openEdit(r: Repository) {
    setEditing(r);
    setFormOpen(true);
  }

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
          <Plus className="w-4 h-4 mr-1.5" /> Add repository
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && repos?.length === 0 && (
        <div className="text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No repositories yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {repos?.map((repo) => (
          <div
            key={repo.id}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-border shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <GitBranch className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {repo.title}
              </p>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-700 truncate flex items-center gap-1"
              >
                {repo.url} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
            <div className="flex gap-1">
              <CopyButton value={repo.url} label="Repository URL" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => openEdit(repo)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={() => setDeleting(repo)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit repository" : "Add repository"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="Frontend" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>URL *</Label>
              <Input
                placeholder="https://github.com/..."
                {...register("url")}
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url.message}</p>
              )}
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
        title="Delete repository?"
        description={<>Delete <strong>{deleting?.title}</strong>? This cannot be undone.</>}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        isPending={deleteMutation.isPending}
        confirmLabel="Delete repository"
      />
    </div>
  );
}
