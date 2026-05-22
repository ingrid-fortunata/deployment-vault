"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Company } from "@/types";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company;
}

export function DeleteCompanyDialog({ open, onOpenChange, company }: Readonly<Props>) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/companies/${company.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company deleted");
      onOpenChange(false);
      router.push("/dashboard");
    },
    onError: () => toast.error("Failed to delete company"),
  });

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete company?"
      description={
        <>
          This will permanently delete <strong>{company.name}</strong> and all its projects,
          repositories, deployments, and documents. This action cannot be undone.
        </>
      }
      onConfirm={() => mutation.mutate()}
      isPending={mutation.isPending}
      confirmLabel="Delete company"
    />
  );
}
