"use client";

import { useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useTheme } from "next-themes";
import { ArrowRight, Check, Loader2 } from "lucide-react";

const SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

type SubmitState = "idle" | "submitting" | "success" | "error";

export function HostedContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const { resolvedTheme } = useTheme();
  const captchaTheme: "dark" | "light" =
    resolvedTheme === "dark" ? "dark" : "light";

  const ready =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length >= 10 &&
    hcaptchaToken !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || state === "submitting") return;
    setState("submitting");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, hcaptchaToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }
      setState("success");
      setName("");
      setEmail("");
      setMessage("");
      setHcaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setHcaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <span className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check className="h-5 w-5" />
        </span>
        <h3 className="mt-3 text-lg font-semibold tracking-tight">
          Message sent.
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          I&rsquo;ll reply from{" "}
          <span className="font-mono">hello@digestibleapps.com</span> within a
          day or two.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <Field label="Name" htmlFor="contact-name">
        <input
          id="contact-name"
          type="text"
          required
          autoComplete="name"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </Field>

      <Field label="Email" htmlFor="contact-email">
        <input
          id="contact-email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </Field>

      <Field
        label="Message"
        htmlFor="contact-message"
        hint="Tell me a bit about your team and what you’d use it for."
      >
        <textarea
          id="contact-message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </Field>

      {SITE_KEY ? (
        <div className="flex justify-center">
          <HCaptcha
            ref={captchaRef}
            sitekey={SITE_KEY}
            onVerify={(token) => setHcaptchaToken(token)}
            onExpire={() => setHcaptchaToken(null)}
            onError={() => setHcaptchaToken(null)}
            theme={captchaTheme}
          />
        </div>
      ) : (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
          Captcha not configured. Set{" "}
          <code className="font-mono">NEXT_PUBLIC_HCAPTCHA_SITE_KEY</code> in
          <code className="font-mono"> .env.local</code> to enable submissions.
        </p>
      )}

      {error && (
        <p className="text-sm text-brand-accent" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!ready || state === "submitting" || !SITE_KEY}
        className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-foreground px-7 text-sm font-medium text-background shadow-lg shadow-foreground/10 transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "submitting" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Contact me about hosted access
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
