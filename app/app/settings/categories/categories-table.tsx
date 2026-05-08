"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Tag, Loader2 } from "lucide-react";
import type { z } from "zod";
import {
  TimeCategoryCreateInput,
  type TimeCategory,
} from "@/lib/validators";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormIn = z.input<typeof TimeCategoryCreateInput>;
type FormOut = z.output<typeof TimeCategoryCreateInput>;
type CategoriesResponse = { categories: TimeCategory[] };

const COLOR_OPTIONS = [
  "rose",
  "amber",
  "teal",
  "indigo",
  "sky",
  "slate",
  "emerald",
  "violet",
];

const COLOR_DOT: Record<string, string> = {
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  teal: "bg-teal-500",
  indigo: "bg-indigo-500",
  sky: "bg-sky-500",
  slate: "bg-slate-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
};

const FORM_DEFAULTS: FormIn = {
  name: "",
  color: "teal",
  active: true,
};

async function fetchCategories(): Promise<CategoriesResponse> {
  const res = await fetch("/api/categories", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load categories");
  return res.json();
}

async function createCategory(input: FormOut): Promise<TimeCategory> {
  const res = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Create failed");
  return body.category as TimeCategory;
}

async function updateCategory(
  id: string,
  patch: Partial<TimeCategory>,
): Promise<TimeCategory> {
  const res = await fetch(`/api/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Update failed");
  return body.category as TimeCategory;
}

async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "Delete failed");
  }
}

export function CategoriesTable() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["time-categories"],
    queryFn: fetchCategories,
  });
  const categories = data?.categories ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TimeCategory | null>(null);
  const [deleting, setDeleting] = useState<TimeCategory | null>(null);

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateCategory(id, { active }),
    onMutate: async ({ id, active }) => {
      await qc.cancelQueries({ queryKey: ["time-categories"] });
      const prev = qc.getQueryData<CategoriesResponse>(["time-categories"]);
      qc.setQueryData<CategoriesResponse>(["time-categories"], (old) => ({
        categories: (old?.categories ?? []).map((c) =>
          c.id === id ? { ...c, active } : c,
        ),
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["time-categories"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["time-categories"] }),
  });

  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_v, id) => {
      qc.setQueryData<CategoriesResponse>(["time-categories"], (old) => ({
        categories: (old?.categories ?? []).filter((c) => c.id !== id),
      }));
      qc.invalidateQueries({ queryKey: ["time-categories"] });
      setDeleting(null);
    },
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (cat: TimeCategory) => {
    setEditing(cat);
    setDialogOpen(true);
  };

  return (
    <main className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Time Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${categories.length} ${categories.length === 1 ? "category" : "categories"}`}
          </p>
        </div>
        <Button className="cursor-pointer" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add category
        </Button>
      </div>

      {categories.length === 0 && !isLoading ? (
        <EmptyState onAdd={openNew} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Color</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr
                  key={c.id}
                  className={cn(
                    "border-b border-border/60 last:border-b-0",
                    !c.active && "opacity-60",
                  )}
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">
                    {c.color ? (
                      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className={cn(
                            "h-3 w-3 rounded-full",
                            COLOR_DOT[c.color] ?? "bg-muted",
                          )}
                        />
                        {c.color}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleActive.mutate({ id: c.id, active: !c.active })
                      }
                      className={cn(
                        "inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors",
                        c.active ? "bg-primary" : "bg-muted",
                      )}
                      aria-pressed={c.active}
                      aria-label={c.active ? "Deactivate" : "Activate"}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform",
                          c.active ? "translate-x-4" : "translate-x-0.5",
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => openEdit(c)}
                        aria-label={`Edit ${c.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting(c)}
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  Existing time entries tagged with{" "}
                  <span className="font-medium text-foreground">
                    {deleting.name}
                  </span>{" "}
                  will keep their data — the category just becomes blank on
                  those rows. Deactivate instead if you only want to hide it.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {remove.error && (
            <p className="text-sm text-destructive">
              {(remove.error as Error).message}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove.mutate(deleting.id)}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Tag className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">
        No categories yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Categories tag your time entries so you can roll up totals by type of
        work.
      </p>
      <Button className="mt-4 cursor-pointer" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add category
      </Button>
    </div>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: TimeCategory | null;
}) {
  const qc = useQueryClient();
  const isEdit = category !== null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(TimeCategoryCreateInput),
    defaultValues: FORM_DEFAULTS,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      category
        ? {
            name: category.name,
            color: category.color ?? "teal",
            active: category.active,
          }
        : FORM_DEFAULTS,
    );
  }, [open, category, reset]);

  const save = useMutation({
    mutationFn: async (input: FormOut) => {
      return isEdit
        ? updateCategory(category.id, input)
        : createCategory(input);
    },
    onSuccess: (saved) => {
      qc.setQueryData<CategoriesResponse>(["time-categories"], (old) => {
        const list = old?.categories ?? [];
        const next = isEdit
          ? list.map((c) => (c.id === saved.id ? saved : c))
          : [...list, saved];
        next.sort((a, b) => a.position - b.position);
        return { categories: next };
      });
      qc.invalidateQueries({ queryKey: ["time-categories"] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit((data) => save.mutate(data))}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit category" : "Add category"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Rename or recolor this category. Existing entries stay tagged with it."
                : "A new category will appear in the timer widget and the manual-entry dialog."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                autoFocus
                {...register("name")}
                placeholder="e.g. Design, R&D, Code"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Select
                    value={typeof field.value === "string" && field.value ? field.value : "teal"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={cn(
                                "h-3 w-3 rounded-full",
                                COLOR_DOT[c],
                              )}
                            />
                            {c}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {save.error && (
              <p className="text-sm text-destructive">
                {(save.error as Error).message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={save.isPending}
              className="cursor-pointer"
            >
              {save.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                "Save"
              ) : (
                "Add category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
