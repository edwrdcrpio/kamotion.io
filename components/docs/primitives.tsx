import type { ReactNode } from "react";
import Link from "next/link";
import { Camera, Info, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

export function DocSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border/60 py-14 first:pt-0 last:border-b-0">
      {eyebrow && (
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function DocH3({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3
      id={id}
      className="scroll-mt-24 mt-6 text-xl font-semibold tracking-tight text-foreground"
    >
      {children}
    </h3>
  );
}

export function DocP({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-muted-foreground">{children}</p>;
}

export function DocStrong({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}

export function DocLink({ href, children }: { href: string; children: ReactNode }) {
  const isInternal = href.startsWith("/") || href.startsWith("#");
  if (isInternal) {
    return (
      <Link
        href={href}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

export function DocList({
  items,
  ordered = false,
}: {
  items: ReactNode[];
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`flex flex-col gap-2 pl-5 text-[15px] leading-relaxed text-muted-foreground ${
        ordered ? "list-decimal" : "list-disc"
      } marker:text-muted-foreground/60`}
    >
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

export function DocCode({
  children,
  lang,
}: {
  children: string;
  lang?: string;
}) {
  return (
    <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-muted/50 px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground">
      {lang && (
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {lang}
        </span>
      )}
      <code>{children}</code>
    </pre>
  );
}

export function DocInlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

export function DocCallout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "tip";
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: {
      wrap: "border-primary/40 bg-primary/5",
      icon: "text-primary",
      Icon: Info,
    },
    warn: {
      wrap: "border-brand-warning/40 bg-brand-warning/5",
      icon: "text-brand-warning",
      Icon: AlertTriangle,
    },
    tip: {
      wrap: "border-brand-success/40 bg-brand-success/5",
      icon: "text-brand-success",
      Icon: Sparkles,
    },
  };
  const s = styles[tone];
  return (
    <aside
      className={`my-2 flex gap-3 rounded-lg border ${s.wrap} px-4 py-3 text-[14px] leading-relaxed text-foreground/90`}
    >
      <s.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.icon}`} />
      <div className="flex-1">
        {title && <p className="font-medium text-foreground">{title}</p>}
        <div className={title ? "mt-1 text-muted-foreground" : ""}>{children}</div>
      </div>
    </aside>
  );
}

export function DocFigure({
  label,
  route,
  theme,
  capture,
  notes,
  children,
}: {
  label: string;
  route?: string;
  theme?: "light" | "dark" | "both";
  capture: string;
  notes?: string;
  children?: ReactNode;
}) {
  return (
    <figure className="my-4 overflow-hidden rounded-xl border border-dashed border-border bg-muted/30">
      {children ? (
        <div className="border-b border-border/60 bg-background p-4">{children}</div>
      ) : (
        <div className="flex min-h-[220px] items-center justify-center border-b border-border/60 bg-background p-8">
          <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
            <Camera className="h-5 w-5 text-muted-foreground/60" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Screenshot placeholder
            </span>
          </div>
        </div>
      )}
      <figcaption className="flex flex-col gap-1.5 px-4 py-3 text-[12px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            {children ? "Mock" : "Capture"}
          </span>
          <span className="font-medium text-foreground">{label}</span>
          {route && (
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {route}
            </span>
          )}
          {theme && (
            <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {theme === "both" ? "light + dark" : theme}
            </span>
          )}
        </div>
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/80">What to show: </span>
          {capture}
        </p>
        {notes && (
          <p className="text-[12px] leading-relaxed text-muted-foreground/80">
            <span className="font-medium text-foreground/70">Notes: </span>
            {notes}
          </p>
        )}
      </figcaption>
    </figure>
  );
}

export function DocTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="my-2 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-[14px]">
        <thead className="bg-muted/40">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left font-medium text-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-muted-foreground align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocCardLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  const isInternal = href.startsWith("/") || href.startsWith("#");
  const className =
    "group flex items-start justify-between gap-3 rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/60 hover:bg-accent/40";
  const body = (
    <>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </>
  );
  if (isInternal) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  );
}
