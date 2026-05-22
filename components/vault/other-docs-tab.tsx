"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  Link2,
  KeyRound,
  StickyNote,
} from "lucide-react";
import {
  projectDocumentSchema,
  type ProjectDocumentInput,
} from "@/lib/validations";
import type { ProjectDocument, DocumentType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SecretField } from "./secret-field";
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

async function fetchDocs(projectId: string): Promise<ProjectDocument[]> {
  const res = await fetch(`/api/projects/${projectId}/documents`);
  if (!res.ok) throw new Error("Failed");
  return (await res.json()).data;
}

const TYPE_OPTIONS: DocumentType[] = ["link", "note", "credential", "document"];

const TYPE_ICONS: Record<DocumentType, React.ReactNode> = {
  link: <Link2 className="w-4 h-4 text-blue-500" />,
  note: <StickyNote className="w-4 h-4 text-amber-500" />,
  credential: <KeyRound className="w-4 h-4 text-red-500" />,
  document: <FileText className="w-4 h-4 text-violet-500" />,
};

const TYPE_ICON_BG: Record<DocumentType, string> = {
  link: "bg-blue-50",
  note: "bg-amber-50",
  credential: "bg-red-50",
  document: "bg-violet-50",
};

const TYPE_BADGE: Record<DocumentType, string> = {
  link: "bg-blue-50 text-blue-700 border-blue-200",
  note: "bg-amber-50 text-amber-700 border-amber-200",
  credential: "bg-red-50 text-red-700 border-red-200",
  document: "bg-violet-50 text-violet-700 border-violet-200",
};

const SENSITIVE_TYPES = new Set<DocumentType>(["credential", "note"]);

function DocValue({
  doc,
  isSens,
}: Readonly<{ doc: ProjectDocument; isSens: boolean }>) {
  if (!doc.value) return null;
  if (isSens) {
    return (
      <SecretField
        value={doc.value}
        label={doc.title}
        multiline={doc.value.includes("\n")}
      />
    );
  }
  if (doc.type === "link") {
    return (
      <a
        href={doc.value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-indigo-600 hover:text-indigo-700"
      >
        {doc.value}
      </a>
    );
  }
  return <p className="text-xs text-muted-foreground">{doc.value}</p>;
}

export function OtherDocsTab({ projectId }: Readonly<Props>) {
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectDocument | null>(null);
  const [deleting, setDeleting] = useState<ProjectDocument | null>(null);

  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents", projectId],
    queryFn: () => fetchDocs(projectId),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectDocumentInput>({
    resolver: zodResolver(projectDocumentSchema),
    defaultValues: { title: "", type: "link", value: "" },
  });

  const typeValue = watch("type");

  function openAdd() {
    setEditing(null);
    reset({ title: "", type: "link", value: "" });
    setFormOpen(true);
  }
  function openEdit(d: ProjectDocument) {
    setEditing(d);
    reset({ title: d.title, type: d.type, value: d.value ?? "" });
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
      const res = await fetch(`/api/projects/${projectId}/documents/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", projectId] });
      toast.success("Deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const isSensitive = SENSITIVE_TYPES.has(typeValue);
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
          <Plus className="w-4 h-4 mr-1.5" /> Add document
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
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No documents yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {docs?.map((doc) => {
          const isSensDoc = SENSITIVE_TYPES.has(doc.type);
          return (
            <div
              key={doc.id}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-border shadow-sm"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_ICON_BG[doc.type]}`}
              >
                {TYPE_ICONS[doc.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {doc.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs ${TYPE_BADGE[doc.type]}`}
                  >
                    {doc.type}
                  </Badge>
                </div>
                <div className="mt-1">
                  <DocValue doc={doc} isSens={isSensDoc} />
                </div>
              </div>
              <div className="flex gap-1">
                {doc.value && !isSensDoc && (
                  <CopyButton value={doc.value} label={doc.title} />
                )}
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
          );
        })}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit document" : "Add document"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) => saveMutation.mutate(d))}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="My API Key" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select
                value={typeValue}
                onValueChange={(v) => setValue("type", v as DocumentType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Value{" "}
                {isSensitive && (
                  <span className="text-xs text-amber-600 font-normal">
                    (encrypted)
                  </span>
                )}
              </Label>
              {isSensitive ? (
                <Textarea
                  className="font-mono text-xs resize-none"
                  rows={4}
                  {...register("value")}
                />
              ) : (
                <Input
                  placeholder={typeValue === "link" ? "https://..." : "Value…"}
                  {...register("value")}
                />
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
        title="Delete document?"
        description={<>Delete <strong>{deleting?.title}</strong>?</>}
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        isPending={deleteMutation.isPending}
        confirmLabel="Delete document"
      />
    </div>
  );
}
