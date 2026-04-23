"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, UserPlus, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { TeamMember } from "@/lib/validators";

type MembersResponse = { members: TeamMember[] };

async function fetchMembers(): Promise<MembersResponse> {
  const res = await fetch("/api/team", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load team");
  return res.json();
}

export function PersonCombobox({
  value,
  onChange,
  placeholder = "Select or type a name…",
  id,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data } = useQuery({
    queryKey: ["team"],
    queryFn: fetchMembers,
    staleTime: 60_000,
  });
  const members = useMemo(
    () => (data?.members ?? []).filter((m) => m.active),
    [data],
  );

  // Does the current value match an existing team member?
  const matched = members.find(
    (m) => m.name.toLowerCase() === value.toLowerCase(),
  );

  const trimmed = query.trim();
  const showCustomOption =
    trimmed.length > 0 &&
    !members.some((m) => m.name.toLowerCase() === trimmed.toLowerCase());

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full cursor-pointer justify-between font-normal"
        >
          <span className={cn("flex items-center gap-2 truncate", !value && "text-muted-foreground")}>
            {matched && <Link2 className="h-3.5 w-3.5 text-primary" />}
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command shouldFilter={true}>
          <CommandInput
            placeholder="Search or type a name…"
            value={query}
            onValueChange={setQuery}
            className="text-xs"
          />
          <CommandList>
            <CommandEmpty className="py-4 text-xs">
              No team members match.
            </CommandEmpty>
            {members.length > 0 && (
              <CommandGroup heading="Team">
                {members.map((m) => {
                  const isSelected =
                    value.toLowerCase() === m.name.toLowerCase();
                  return (
                    <CommandItem
                      key={m.id}
                      value={m.name}
                      onSelect={() => pick(m.name)}
                      className="text-xs"
                    >
                      <span
                        className={cn(
                          "flex-1",
                          isSelected && "font-medium text-primary",
                        )}
                      >
                        {m.name}
                      </span>
                      {m.role && (
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          {m.role}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {showCustomOption && (
              <CommandGroup heading="Other">
                <CommandItem
                  value={`__custom__${trimmed}`}
                  onSelect={() => pick(trimmed)}
                  className="text-xs"
                >
                  <UserPlus className="mr-1 h-3.5 w-3.5" />
                  Use &ldquo;{trimmed}&rdquo;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
