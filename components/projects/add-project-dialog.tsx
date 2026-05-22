"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectSchema, type ProjectInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Project } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  project?: Project;
}

export function AddProjectDialog({ open, onOpenChange, companyId, project }: Readonly<Props>) {
  const queryClient = useQueryClient();
  const isEdit = !!project;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: project
      ? { name: project.name, description: project.description ?? "" }
      : {},
  });

  const mutation = useMutation({
    mutationFn: async (data: ProjectInput) => {
      const url = isEdit
        ? `/api/companies/${companyId}/projects/${project!.id}`
        : `/api/companies/${companyId}/projects`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to save project");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", companyId] });
      toast.success(isEdit ? "Project updated" : "Project created");
      reset();
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "Add project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-slate-300">Name *</Label>
            <Input
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="My Project"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-slate-300">Description</Label>
            <Textarea
              className="bg-slate-700 border-slate-600 text-white resize-none"
              placeholder="Brief description..."
              rows={3}
              {...register("description")}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
