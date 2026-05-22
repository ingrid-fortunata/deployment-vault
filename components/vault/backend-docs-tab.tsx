"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, BookOpen, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  backendDocumentationSchema,
  type BackendDocumentationInput,
} from "@/lib/validations";
import type { BackendDocumentation } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BackendDocumentationInput>({
    resolver: zodResolver(backendDocumentationSchema),
    values: editing
      ? {
          title: editing.title,
          url: editing.url,
          description: editing.description ?? "",
        }
      : { title: "", url: "", description: "" },
  });

  function openAdd() {
    setEditing(null);
    reset({ title: "", url: "", description: "" });
    setFormOpen(true);
  }
  function openEdit(d: BackendDocumentation) {
    setEditing(d);
    setFormOpen(true);
  }

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
      const res = await fetch(`/api/projects/${projectId}/backend-docs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["backend-docs", projectId] });
      toast.success("Deleted");
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
          <Plus className="w-4 h-4 mr-1.5" /> Add documentation
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-16 bg-muted" />
          ))}
        </div>
      )}

      {!isLoading && docs?.length === 0 && (
        <div className="text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No backend documentation yet.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {docs?.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-border shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{doc.title}</p>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-0.5"
              >
                {doc.url} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              {doc.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {doc.description}
                </p>
              )}
            </div>
            <div className="flex gap-1">
              <CopyButton value={doc.url} label="URL" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => openEdit(doc)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={() => setDeleting(doc)}
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
              {editing ? "Edit documentation" : "Add documentation"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="Postman" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>URL *</Label>
              <Input placeholder="https://..." {...register("url")} />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                className="resize-none"
                rows={2}
                {...register("description")}
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
        title="Delete documentation?"
        description={<>Delete <strong>{deleting?.title}</strong>?</>}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        isPending={deleteMutation.isPending}
        confirmLabel="Delete documentation"
      />
    </div>
  );
}
