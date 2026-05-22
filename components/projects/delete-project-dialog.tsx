"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Project } from "@/types";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  companyId: string;
}

export function DeleteProjectDialog({ open, onOpenChange, project, companyId }: Readonly<Props>) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/companies/${companyId}/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", companyId] });
      toast.success("Project deleted");
      onOpenChange(false);
      router.push(`/dashboard/companies/${companyId}`);
    },
    onError: () => toast.error("Failed to delete project"),
  });

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete project?"
      description={
        <>
          This will permanently delete <strong>{project.name}</strong> and all its data.
          This action cannot be undone.
        </>
      }
      onConfirm={() => mutation.mutate()}
      isPending={mutation.isPending}
      confirmLabel="Delete project"
    />
  );
}
