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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

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

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RepositoryInput>({
    resolver: zodResolver(repositorySchema),
    values: editing ? { title: editing.title, url: editing.url } : { title: "", url: "" },
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
      const res = await fetch(`/api/projects/${projectId}/repositories/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repos", projectId] });
      toast.success("Repository deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  function openAdd() { setEditing(null); reset({ title: "", url: "" }); setFormOpen(true); }
  function openEdit(r: Repository) { setEditing(r); setFormOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add repository
        </Button>
      </div>

      {isLoading && <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-16 bg-slate-800" />)}</div>}

      {!isLoading && repos?.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <GitBranch className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p>No repositories yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {repos?.map((repo) => (
          <div key={repo.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
            <GitBranch className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{repo.title}</p>
              <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 truncate flex items-center gap-1">
                {repo.url} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex gap-1">
              <CopyButton value={repo.url} label="Repository URL" />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => openEdit(repo)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setDeleting(repo)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit repository" : "Add repository"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-slate-300">Title *</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Frontend" {...register("title")} />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">URL *</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="https://github.com/..." {...register("url")} />
              {errors.url && <p className="text-xs text-red-400">{errors.url.message}</p>}
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

      {/* Delete dialog */}
      {deleting && (
        <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete repository?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Delete <strong className="text-white">{deleting.title}</strong>? This cannot be undone.
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
