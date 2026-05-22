"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, BookOpen, Pencil, Trash2, ExternalLink } from "lucide-react";
import { backendDocumentationSchema, type BackendDocumentationInput } from "@/lib/validations";
import type { BackendDocumentation } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "./copy-button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Props { projectId: string; companyId: string; }

async function fetchDocs(projectId: string): Promise<BackendDocumentation[]> {
  const res = await fetch(`/api/projects/${projectId}/backend-docs`);
  if (!res.ok) throw new Error("Failed");
  return (await res.json()).data;
}

export function BackendDocsTab({ projectId }: Readonly<Props>) {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BackendDocumentation | null>(null);
  const [deleting, setDeleting] = useState<BackendDocumentation | null>(null);

  const { data: docs, isLoading } = useQuery({
    queryKey: ["backend-docs", projectId],
    queryFn: () => fetchDocs(projectId),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BackendDocumentationInput>({
    resolver: zodResolver(backendDocumentationSchema),
    values: editing ? { title: editing.title, url: editing.url, description: editing.description ?? "" } : { title: "", url: "", description: "" },
  });

  function openAdd() { setEditing(null); reset({ title: "", url: "", description: "" }); setFormOpen(true); }
  function openEdit(d: BackendDocumentation) { setEditing(d); setFormOpen(true); }

  const saveMutation = useMutation({
    mutationFn: async (data: BackendDocumentationInput) => {
      const url = editing
        ? `/api/projects/${projectId}/backend-docs/${editing.id}`
        : `/api/projects/${projectId}/backend-docs`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["backend-docs", projectId] });
      toast.success(editing ? "Updated" : "Added");
      setFormOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${projectId}/backend-docs/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["backend-docs", projectId] });
      toast.success("Deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add documentation
        </Button>
      </div>

      {isLoading && <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-16 bg-slate-800" />)}</div>}

      {!isLoading && docs?.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p>No backend documentation yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {docs?.map((doc) => (
          <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
            <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{doc.title}</p>
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5">
                {doc.url} <ExternalLink className="w-3 h-3" />
              </a>
              {doc.description && <p className="text-xs text-slate-400 mt-1">{doc.description}</p>}
            </div>
            <div className="flex gap-1">
              <CopyButton value={doc.url} label="URL" />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => openEdit(doc)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setDeleting(doc)}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit documentation" : "Add documentation"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-slate-300">Title *</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="Postman" {...register("title")} />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">URL *</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="https://..." {...register("url")} />
              {errors.url && <p className="text-xs text-red-400">{errors.url.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Description</Label>
              <Textarea className="bg-slate-700 border-slate-600 text-white resize-none" rows={2} {...register("description")} />
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
              <AlertDialogTitle>Delete documentation?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                Delete <strong className="text-white">{deleting.title}</strong>?
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
