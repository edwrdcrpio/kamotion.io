"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  UserPlus,
} from "lucide-react";
import type { z } from "zod";
import {
  AdminUserCreateInput,
  AdminUserUpdateInput,
  type AppUser,
  type Role,
  type ProfileStatus,
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

type UsersResponse = { users: AppUser[] };

type CreateIn = z.input<typeof AdminUserCreateInput>;
type CreateOut = z.output<typeof AdminUserCreateInput>;
type UpdateIn = z.input<typeof AdminUserUpdateInput>;
type UpdateOut = z.output<typeof AdminUserUpdateInput>;

const ROLE_OPTIONS: Role[] = ["admin", "editor", "viewer"];
const STATUS_OPTIONS: ProfileStatus[] = ["active", "disabled"];

const ROLE_TONE: Record<Role, string> = {
  admin: "bg-primary/15 text-primary",
  editor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
  viewer: "bg-muted text-muted-foreground",
};

async function fetchUsers(): Promise<UsersResponse> {
  const res = await fetch("/api/admin/users", { cache: "no-store" });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Failed to load users");
  return body;
}

async function createUser(input: CreateOut): Promise<AppUser> {
  const res = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Create failed");
  return body.user as AppUser;
}

async function patchUser(id: string, input: UpdateOut): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "Update failed");
  }
}

async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "Delete failed");
  }
}

export function UsersTable({
  currentUserId,
  serviceRoleConfigured,
}: {
  currentUserId: string;
  serviceRoleConfigured: boolean;
}) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: fetchUsers,
    enabled: serviceRoleConfigured,
  });
  const users = data?.users ?? [];

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleting, setDeleting] = useState<AppUser | null>(null);

  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: (_v, id) => {
      qc.setQueryData<UsersResponse>(["admin", "users"], (old) => ({
        users: (old?.users ?? []).filter((u) => u.id !== id),
      }));
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setDeleting(null);
    },
  });

  return (
    <main className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {!serviceRoleConfigured
              ? "Service role key required"
              : isLoading
                ? "Loading…"
                : error
                  ? (error as Error).message
                  : `${users.length} ${users.length === 1 ? "user" : "users"}`}
          </p>
        </div>
        <Button
          className="cursor-pointer"
          onClick={() => setCreateOpen(true)}
          disabled={!serviceRoleConfigured}
        >
          <Plus className="h-4 w-4" />
          Add user
        </Button>
      </div>

      {!serviceRoleConfigured ? (
        <ServiceRoleMissingBanner />
      ) : users.length === 0 && !isLoading && !error ? (
        <EmptyState onAdd={() => setCreateOpen(true)} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr
                    key={u.id}
                    className={cn(
                      "border-b border-border/60 last:border-b-0",
                      u.status === "disabled" && "opacity-60",
                    )}
                  >
                    <td className="px-4 py-3 font-medium">
                      {u.full_name || (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {isSelf && (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          you
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize",
                          ROLE_TONE[u.role],
                        )}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {u.status}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {u.last_logged_in_at
                        ? u.last_logged_in_at.slice(0, 10)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => setEditing(u)}
                          aria-label={`Edit ${u.full_name || u.email}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                          onClick={() => setDeleting(u)}
                          disabled={isSelf}
                          aria-label={`Delete ${u.full_name || u.email}`}
                          title={
                            isSelf
                              ? "You can't delete your own account"
                              : undefined
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditDialog
        user={editing}
        currentUserId={currentUserId}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  This removes{" "}
                  <span className="font-medium text-foreground">
                    {deleting.full_name || deleting.email}
                  </span>{" "}
                  from auth and from profiles. They&apos;ll be signed out and
                  can&apos;t sign back in. Cards they created stay on the
                  board.
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

function ServiceRoleMissingBanner() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
        <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">
        Service role key not configured
      </h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        Add{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          SUPABASE_SERVICE_ROLE_KEY
        </code>{" "}
        to <code className="font-mono text-xs">.env.local</code> and restart the
        dev server. You&apos;ll find it in the Supabase dashboard under
        Settings → API.
      </p>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <UserPlus className="h-6 w-6 text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold tracking-tight">
        No users yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        There&apos;s no public signup — provision new users here.
      </p>
      <Button className="mt-4 cursor-pointer" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        Add user
      </Button>
    </div>
  );
}

function CreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateIn, unknown, CreateOut>({
    resolver: zodResolver(AdminUserCreateInput),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "viewer",
    },
  });

  useEffect(() => {
    if (!open)
      reset({
        email: "",
        password: "",
        full_name: "",
        role: "viewer",
      });
  }, [open, reset]);

  const create = useMutation({
    mutationFn: createUser,
    onSuccess: (user) => {
      qc.setQueryData<UsersResponse>(["admin", "users"], (old) => {
        const next = [...(old?.users ?? []), user];
        next.sort((a, b) => a.full_name.localeCompare(b.full_name));
        return { users: next };
      });
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit((data) => create.mutate(data))}>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              The user signs in with email + password — share their initial
              password securely; they can change it from their settings later.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="user-name">Full name</Label>
              <Input
                id="user-name"
                autoFocus
                {...register("full_name")}
                placeholder="Jamie Rivera"
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
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
              <Label htmlFor="user-password">Initial password</Label>
              <Input
                id="user-password"
                type="text"
                autoComplete="new-password"
                {...register("password")}
                placeholder="Min 8 characters"
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? "viewer"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r} className="capitalize">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {create.error && (
              <p className="text-sm text-destructive">
                {(create.error as Error).message}
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
              disabled={create.isPending}
              className="cursor-pointer"
            >
              {create.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create user"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  user,
  currentUserId,
  onOpenChange,
}: {
  user: AppUser | null;
  currentUserId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const open = user !== null;
  const isSelf = user?.id === currentUserId;
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<UpdateIn, unknown, UpdateOut>({
    resolver: zodResolver(AdminUserUpdateInput),
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        password: "",
      });
    }
  }, [user, reset]);

  const save = useMutation({
    mutationFn: async (input: UpdateOut) => {
      if (!user) throw new Error("No user selected");
      await patchUser(user.id, input);
      return { ...user, ...input };
    },
    onSuccess: (updated) => {
      qc.setQueryData<UsersResponse>(["admin", "users"], (old) => ({
        users: (old?.users ?? []).map((u) =>
          u.id === updated.id ? { ...u, ...updated } : u,
        ),
      }));
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {user && (
          <form onSubmit={handleSubmit((data) => save.mutate(data))}>
            <DialogHeader>
              <DialogTitle>Edit user</DialogTitle>
              <DialogDescription className="font-mono text-xs">
                {user.email}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-name">Full name</Label>
                <Input id="edit-name" {...register("full_name")} />
                {errors.full_name && (
                  <p className="text-xs text-destructive">
                    {errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Role</Label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? user.role}
                        onValueChange={field.onChange}
                        disabled={isSelf}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem
                              key={r}
                              value={r}
                              className="capitalize"
                            >
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? user.status}
                        onValueChange={field.onChange}
                        disabled={isSelf}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="capitalize"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {isSelf && (
                <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    Role and status are locked for your own account so you
                    don&apos;t lock yourself out.
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-password">
                  New password (leave blank to keep current)
                </Label>
                <Input
                  id="edit-password"
                  type="text"
                  autoComplete="new-password"
                  {...register("password")}
                  placeholder="Min 8 characters"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
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
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
