import { ZodError } from "zod";
import { getSession, type Session } from "@/lib/auth";
import type { Role } from "@/lib/validators";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requireRole(allowed: Role[]): Promise<Session> {
  const session = await getSession();
  if (!session) throw new HttpError(401, "Not signed in");
  if (session.profile.status !== "active") {
    throw new HttpError(403, "Account is disabled");
  }
  if (!allowed.includes(session.profile.role)) {
    throw new HttpError(403, "Insufficient permissions");
  }
  return session;
}

export function toResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return Response.json(
      { error: "Validation failed", issues: error.issues },
      { status: 400 },
    );
  }
  console.error("[api] Unhandled error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
