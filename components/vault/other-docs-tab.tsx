"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, FileText, Pencil, Trash2, Link2, KeyRound, StickyNote } from "lucide-react";
import { projectDocumentSchema, type ProjectDocumentInput } from "@/lib/validations";
import type { ProjectDocument, DocumentType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SecretField } from "./secret-field";
import { CopyButton } from "./copy-button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Props { projectId: string; companyId: string; }

async function fetchDocs(projectId: string): Promise<ProjectDocument[]> {
  const res = await fetch(`/api/projects/${projectId}/documents`);
  if (!res.ok) throw new Error("Failed");
  return (await res.json()).data;
}

const TYPE_OPTIONS: DocumentType[] = ["link", "note", "credential", "document"];
const TYPE_ICONS: Record<DocumentType, React.ReactNode> = {
  link: <Link2 className="w-4 h-4 text-blue-400" />,
  note: <StickyNote className="w-4 h-4 text-yellow-400" />,
  credential: <KeyRound className="w-4 h-4 text-red-400" />,
  document: <FileText className="w-4 h-4 text-purple-400" />,
};
const TYPE_COLORS: Record<DocumentType, string> = {
  link: "bg-blue-600/20 text-blue-300 border-blue-600/30",
  note: "bg-yellow-600/20 text-yellow-300 border-yellow-600/30",
  credential: "bg-red-600/20 text-red-300 border-red-600/30",
  document: "bg-purple-600/20 text-purple-300 border-purple-600/30",
};
const SENSITIVE_TYPES: DocumentType[] = ["credential", "note"];

export function OtherDocsTab({ projectId }: Readonly<Props>) {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectDocument | null>(null);
  const [deleting, setDeleting] = useState<ProjectDocument | null>(null);

  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents", projectId],
    queryFn: () => fetchDocs(projectId),
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProjectDocumentInput>({
    resolver: zodResolver(projectDocumentSchema),
    defaultValues: { title: "", type: "link", value: "" },
  });

  const typeValue = watch("type");

  function openAdd() { setEditing(null); reset({ title: "", type: "link", value: "" }); setFormOpen(true); }
  function openEdit(d: ProjectDocument) {
    setEditing(d);
    reset({ title: d.title, type: d.type as DocumentType, value: d.value ?? "" });
    setFormOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (data: ProjectDocumentInput) => {
      const url = editing
        ? `/api/projects/${projectId}/documents/${editing.id}`
        : `/api/projects/${projectId}/documents`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", projectId] });
      toast.success(editing ? "Updated" : "Added");
      setFormOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${projectId}/documents/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", projectId] });
      toast.success("Deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const isSensitive = SENSITIVE_TYPES.includes(typeValue as DocumentType);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add document
        </Button>
      </div>

      {isLoading && <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-16 bg-slate-800" />)}</div>}

      {!isLoading && docs?.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p>No documents yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {docs?.map((doc) => {
          const isSensDoc = SENSITIVE_TYPES.includes(doc.type as DocumentType);
          return (
            <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
              <div className="mt-0.5 flex-shrink-0">{TYPE_ICONS[doc.type as DocumentType]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{doc.title}</p>
                  <Badge variant="outline" className={`text-xs ${TYPE_COLORS[doc.type as DocumentType]}`}>
                    {doc.type}
                  </Badge>
                </div>
                {doc.value && (
                  <div className="mt-1">
                    {isSensDoc ? (
                      <SecretField value={doc.value} label={doc.title} multiline={doc.value.includes("\n")} />
                    ) : doc.type === "link" ? (
                      <a href={doc.value} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300">
                        {doc.value}
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400">{doc.value}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                {doc.value && !isSensDoc && <CopyButton value={doc.value} label={doc.title} />}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => openEdit(doc)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => setDeleting(doc)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit document" : "Add document"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-slate-300">Title *</Label>
              <Input className="bg-slate-700 border-slate-600 text-white" placeholder="My API Key" {...register("title")} />
              {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">Type *</Label>
              <Select value={typeValue} onValueChange={(v) => setValue("type", v as DocumentType)}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  {TYPE_OPTIONS.map(t => (
                    <SelectItem key={t} value={t} className="text-white capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-300">
                Value {isSensitive && <span className="text-xs text-amber-400">(encrypted)</span>}
              </Label>
              {isSensitive ? (
                <Textarea className="bg-slate-700 border-slate-600 text-white font-mono text-xs resize-none" rows={4} {...register("value")} />
              ) : (
                <Input className="bg-slate-700 border-slate-600 text-white" placeholder={typeValue === "link" ? "https://..." : "Value..."} {...register("value")} />
              )}
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
              <AlertDialogTitle>Delete document?</AlertDialogTitle>
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
