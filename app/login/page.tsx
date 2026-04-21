import Link from "next/link";
import { redirect } from "next/navigation";
import { brand } from "@/config/brand";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/app");

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            {brand.domain}
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your {brand.name} workspace.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          No account?{" "}
          <a
            href={`mailto:hello@${brand.domain}?subject=Kamotion access request`}
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Request access
          </a>
          .
        </p>
      </div>
    </main>
  );
}
