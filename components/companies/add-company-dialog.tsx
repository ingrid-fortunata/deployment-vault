"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { companySchema, type CompanyInput } from "@/lib/validations";
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
import { Company } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company;
}

export function AddCompanyDialog({
  open,
  onOpenChange,
  company,
}: Readonly<Props>) {
  const queryClient = useQueryClient();
  const isEdit = !!company;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: company
      ? {
          name: company.name,
          description: company.description ?? "",
          website: company.website ?? "",
        }
      : {},
  });

  const mutation = useMutation({
    mutationFn: async (data: CompanyInput) => {
      const url = isEdit ? `/api/companies/${company?.id}` : "/api/companies";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Failed to save company");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success(isEdit ? "Company updated" : "Company created");
      reset();
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const idleLabel = isEdit ? "Save changes" : "Create company";
  const submitLabel = mutation.isPending ? "Saving…" : idleLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit company" : "Add company"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input placeholder="Acme Corp" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              className="resize-none"
              placeholder="Brief description…"
              rows={3}
              {...register("description")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input placeholder="https://acme.com" {...register("website")} />
            {errors.website && (
              <p className="text-xs text-destructive">
                {errors.website.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              disabled={mutation.isPending}
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
