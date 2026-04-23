"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import type { z } from "zod";
import {
  CardCreateInput,
  type Card,
  type Status,
  type Priority,
} from "@/lib/validators";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PersonCombobox } from "@/components/ui/person-combobox";
import { DurationSlider } from "./duration-slider";

type FormIn = z.input<typeof CardCreateInput>;
type FormOut = z.output<typeof CardCreateInput>;

type CardsResponse = { cards: Card[] };

const STATUS_OPTIONS: Status[] = [
  "Not Started",
  "Ready",
  "In Progress",
  "Blocked",
  "Review",
  "Approved",
];

const PRIORITY_OPTIONS: Priority[] = ["Low", "Normal", "High"];

const FORM_DEFAULTS: FormIn = {
  task: "",
  assignee: "me",
  requester: "me",
  request_date: "",
  due_date: "",
  estimated_duration: "",
  notes: "",
  status: "Not Started",
  priority: "Normal",
};

export function NewCardDialog() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(CardCreateInput),
    defaultValues: FORM_DEFAULTS,
  });

  const create = useMutation({
    mutationFn: async (input: FormOut) => {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Create failed");
      return body.card as Card;
    },
    onSuccess: (card) => {
      qc.setQueryData<CardsResponse>(["cards"], (old) => ({
        cards: [...(old?.cards ?? []), card],
      }));
      qc.invalidateQueries({ queryKey: ["cards"] });
      reset(FORM_DEFAULTS);
      setOpen(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset(FORM_DEFAULTS);
      }}
    >
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          <Plus className="h-4 w-4" />
          New card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit((data) => create.mutate(data))}>
          <DialogHeader>
            <DialogTitle>New card</DialogTitle>
            <DialogDescription>
              Lands in{" "}
              <span className="font-medium text-foreground">Queue</span>. You
              can edit the rest from the card drawer once B3 ships.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="task">Task</Label>
              <Input
                id="task"
                {...register("task")}
                autoFocus
                placeholder="e.g. Write the onboarding email"
              />
              {errors.task && (
                <p className="text-xs text-destructive">
                  {errors.task.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Controller
                  name="assignee"
                  control={control}
                  render={({ field }) => (
                    <PersonCombobox
                      id="assignee"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="requester">Requester</Label>
                <Controller
                  name="requester"
                  control={control}
                  render={({ field }) => (
                    <PersonCombobox
                      id="requester"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "Not Started"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? "Normal"}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" type="date" {...register("due_date")} />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Estimated duration</Label>
              <Controller
                name="estimated_duration"
                control={control}
                render={({ field }) => (
                  <DurationSlider
                    value={
                      (field.value as string | null | undefined) ?? null
                    }
                    onChange={(v) => field.onChange(v ?? "")}
                  />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                rows={3}
                placeholder="Context, links, constraints…"
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
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={create.isPending}
              className="cursor-pointer"
            >
              {create.isPending ? "Creating…" : "Create card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
