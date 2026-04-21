import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Session = {
  user: { id: string; email: string | null };
  profile: {
    id: string;
    full_name: string;
    role: "admin" | "editor" | "viewer";
    status: "active" | "disabled";
    last_logged_in_at: string | null;
  };
};

export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, status, last_logged_in_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: profile as Session["profile"],
  };
});
