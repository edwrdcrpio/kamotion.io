import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole, toResponse } from "@/lib/rbac";
import { CardCreateInput } from "@/lib/validators";

const BulkInput = z.object({
  cards: z.array(CardCreateInput).min(1).max(50),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(["admin", "editor"]);
    const body = await request.json();
    const input = BulkInput.parse(body);

    const supabase = await createClient();
    const inserts = input.cards.map((c) => ({
      ...c,
      created_by: session.user.id,
    }));

    const { data, error } = await supabase
      .from("cards")
      .insert(inserts)
      .select();
    if (error) throw error;

    return NextResponse.json({ cards: data ?? [] }, { status: 201 });
  } catch (e) {
    return toResponse(e);
  }
}
