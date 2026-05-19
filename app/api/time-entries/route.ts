import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse } from "@/lib/rbac";
import {
  TimeEntryCreateInput,
  TimeEntryListQuery,
} from "@/lib/validators";
import { rangeForPreset, formatMinutes } from "@/lib/time-log/period";
import { toCsv } from "@/lib/time-log/csv";

export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(["admin", "editor", "viewer"]);
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const filters = TimeEntryListQuery.parse(params);

    const supabase = await createClient();
    let query = supabase
      .from("time_entries")
      .select("*, cards(task), time_categories(name, color)")
      .order("started_at", { ascending: false });

    // Default: mine=true. Admins can pass mine=false to see everyone.
    const showAll =
      filters.mine === "false" && session.profile.role === "admin";
    if (!showAll) query = query.eq("created_by", session.user.id);

    if (filters.card_id) query = query.eq("card_id", filters.card_id);
    if (filters.category_id)
      query = query.eq("category_id", filters.category_id);

    if (filters.period) {
      const range = rangeForPreset(
        filters.period,
        new Date(),
        filters.from && filters.to
          ? { from: new Date(filters.from), to: new Date(filters.to) }
          : undefined,
      );
      if (range) {
        query = query
          .gte("started_at", range.start.toISOString())
          .lt("started_at", range.end.toISOString());
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    const entries = data ?? [];

    if (filters.format === "csv") {
      const rows = entries.map((e) => {
        const card = e.cards as { task?: string } | null;
        const cat = e.time_categories as { name?: string } | null;
        return {
          date: e.started_at.slice(0, 10),
          card: card?.task ?? "",
          category: cat?.name ?? "",
          started_at: e.started_at,
          ended_at: e.ended_at ?? "",
          duration: e.duration_minutes != null ? formatMinutes(e.duration_minutes) : "",
          duration_minutes: e.duration_minutes ?? "",
          source: e.source,
          notes: e.notes ?? "",
        };
      });
      const csv = toCsv(rows, [
        { key: "date", header: "Date" },
        { key: "card", header: "Card" },
        { key: "category", header: "Category" },
        { key: "started_at", header: "Started" },
        { key: "ended_at", header: "Ended" },
        { key: "duration", header: "Duration" },
        { key: "duration_minutes", header: "Minutes" },
        { key: "source", header: "Source" },
        { key: "notes", header: "Notes" },
      ]);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="time-log-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ entries });
  } catch (e) {
    return toResponse(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["admin", "editor"]);
    const body = await request.json();
    const input = TimeEntryCreateInput.parse(body);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        ...input,
        source: "manual",
        created_by: session.user.id,
      })
      .select("*, cards(task), time_categories(name, color)")
      .single();
    if (error) throw error;
    return NextResponse.json({ entry: data }, { status: 201 });
  } catch (e) {
    return toResponse(e);
  }
}
