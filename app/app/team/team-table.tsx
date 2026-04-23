"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, UserPlus, Loader2, Link2 } from "lucide-react";
import type { z } from "zod";
import {
  TeamMemberCreateInput,
  type TeamMember,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormIn = z.input<typeof TeamMemberCreateInput>;
type FormOut = z.output<typeof TeamMemberCreateInput>;
type MembersResponse = { members: TeamMember[] };

const FORM_DEFAULTS: FormIn = {
  name: "",
  email: "",
  role: "",
  active: true,
};

async function fetchMembers(): Promise<MembersResponse> {
  const res = await fetch("/api/team", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load team");
  return res.json();
}

async function createMember(input: FormOut): Promise<TeamMember> {
  const res = await fetch("/api/team", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Create failed");
  return body.member as TeamMember;
}

async function updateMember(
  id: string,
  patch: Partial<TeamMember>,
): Promise<TeamMember> {
  const res = await fetch(`/api/team/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Update failed");
  return body.member as TeamMember;
}

async function deleteMember(id: string): Promise<void> {
  const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "Delete failed");
  }
}

export function TeamTable() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["team"],
    queryFn: fetchMembers,
  });
  const members = data?.members ?? [];

  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<TeamMember | null>(null);

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateMember(id, { active }),
    onMutate: async ({ id, active }) => {
      await qc.cancelQueries({ queryKey: ["team"] });
      const prev = qc.getQueryData<MembersResponse>(["team"]);
      qc.setQueryData<MembersResponse>(["team"], (old) => ({
        members: (old?.members ?? []).map((m) =>
          m.id === id ? { ...m, active } : m,
        ),
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["team"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["team"] }),
  });

  const remove = useMutation({
    mutationFn: deleteMember,
    onSuccess: (_v, id) => {
      qc.setQueryData<MembersResponse>(["team"], (old) => ({
        members: (old?.members ?? []).filter((m) => m.id !== id),
      }));
      qc.invalidateQueries({ queryKey: ["team"] });
      setDeleting(null);
    },
  });

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (member: TeamMember) => {
    setEditing(member);
    setDialogOpen(true);
  };

  const totalCount = members.length;
  const activeCount = members.filter((m) => m.active).length;

  return (
    <main className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : error
                ? "Failed to load team."
                : totalCount === 0
                  ? "No members yet"
                  : `${activeCount} active · ${totalCount} total`}
          </p>
        </div>
        <Button className="cursor-pointer" onClick={openNew}>
          <Plus className="h-4 w-4" />
          Add member
        </Button>
      </div>

      {totalCount === 0 && !isLoading ? (
        <EmptyState onAdd={openNew} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.id}
                  className={cn(
                    "border-b border-border/60 last:border-b-0",
                    !m.active && "opacity-60",
                  )}
                >
                  <td className="px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {m.user_id && (
                        <span
                          title="Linked to a user account — name & email sync from Users"
                          aria-label="Linked to user account"
                        >
                          <Link2 className="h-3.5 w-3.5 text-primary" />
                        </span>
                      )}
                      {m.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.role ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleActive.mutate({ id: m.id, active: !m.active })
                      }
                      className={cn(
                        "inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors",
                        m.active ? "bg-primary" : "bg-muted",
                      )}
                      aria-pressed={m.active}
                      aria-label={m.active ? "Deactivate" : "Activate"}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform",
                          m.active ? "translate-x-4" : "translate-x-0.5",
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
                        onClick={() => openEdit(m)}
                        aria-label={`Edit ${m.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleting(m)}
                        aria-label={`Delete ${m.name}`}
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

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editing}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  This removes{" "}
                  <span className="font-medium text-foreground">
                    {deleting.name}
                  </span>{" "}
                  from the team list. Existing cards keep their assignee text;
                  you just won&apos;t be able to pick this person from the
                  picker anymore.
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
              {remove.isPending ? "Removing…" : "Remove"}
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
        <UserPlus className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">
        No team members yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Add the people you collaborate with so the AI parser can suggest them
        as assignees.
      </p>
      <Button className="mt-4 cursor-pointer" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add member
      </Button>
    </div>
  );
}

function MemberDialog({
  open,
  onOpenChange,
  member,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
}) {
  const qc = useQueryClient();
  const isEdit = member !== null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(TeamMemberCreateInput),
    defaultValues: FORM_DEFAULTS,
  });

  // Re-seed form whenever the dialog opens with a different member context.
  useEffect(() => {
    if (!open) return;
    reset(
      member
        ? {
            name: member.name,
            email: member.email ?? "",
            role: member.role ?? "",
            active: member.active,
          }
        : FORM_DEFAULTS,
    );
  }, [open, member, reset]);

  const save = useMutation({
    mutationFn: async (input: FormOut) => {
      return isEdit
        ? updateMember(member.id, input)
        : createMember(input);
    },
    onSuccess: (saved) => {
      qc.setQueryData<MembersResponse>(["team"], (old) => {
        const list = old?.members ?? [];
        const next = isEdit
          ? list.map((m) => (m.id === saved.id ? saved : m))
          : [...list, saved];
        next.sort((a, b) => {
          if (a.active !== b.active) return a.active ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        return { members: next };
      });
      qc.invalidateQueries({ queryKey: ["team"] });
      onOpenChange(false);
    },
  });

  const linked = isEdit && member.user_id !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit((data) => save.mutate(data))}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit team member" : "Add team member"}
            </DialogTitle>
            <DialogDescription>
              {linked
                ? "This member is linked to a user account — name and email are managed in Users. You can still update their role."
                : "People here become assignable on cards and surface to the AI parser as known team members."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {linked && (
              <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
                <Link2 className="h-4 w-4 shrink-0" />
                <span>
                  Linked to a user account. Edit name &amp; email from{" "}
                  <span className="font-medium">Users</span>.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                autoFocus={!linked}
                disabled={linked}
                {...register("name")}
                placeholder="e.g. Jamie Rivera"
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="member-email">Email (optional)</Label>
              <Input
                id="member-email"
                type="email"
                disabled={linked}
                {...register("email")}
                placeholder="jamie@company.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="member-role">Role (optional)</Label>
              <Input
                id="member-role"
                {...register("role")}
                placeholder="e.g. Designer, Engineer"
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
                "Add member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
