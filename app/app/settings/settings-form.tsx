"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Save, CheckCircle2, AlertCircle, FlaskConical } from "lucide-react";
import {
  SettingsUpdateInput,
  type AiProvider as AiProviderT,
  type ProcessingPath as ProcessingPathT,
} from "@/lib/validators";
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
import { cn } from "@/lib/utils";

export type SettingsValues = {
  aiProvider: AiProviderT;
  aiModel: string;
  aiApiKeyRef: string;
  systemPrompt: string;
  processingPath: ProcessingPathT;
  n8nWebhookUrl: string;
};

const PROVIDER_OPTIONS: { value: AiProviderT; label: string }[] = [
  { value: "openrouter", label: "OpenRouter (any model)" },
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
];

// Curated model picks per provider for the "parse unstructured text → structured
// cards" workload. Favor cheap + fast + strong structured-output compliance.
// The "Custom…" sentinel lets admins type any model ID the provider accepts.
const CUSTOM = "__custom__";

type ModelOption = { value: string; label: string; hint?: string };

const MODELS_BY_PROVIDER: Record<AiProviderT, ModelOption[]> = {
  openrouter: [
    {
      value: "anthropic/claude-sonnet-4-6",
      label: "Claude Sonnet 4.6",
      hint: "Recommended · strong schema adherence",
    },
    {
      value: "anthropic/claude-haiku-4-5",
      label: "Claude Haiku 4.5",
      hint: "Fast + cheap Claude",
    },
    {
      value: "openai/gpt-4.1-mini",
      label: "GPT-4.1 mini (OpenAI)",
      hint: "Cheap, verified working",
    },
    {
      value: "openai/gpt-4.1",
      label: "GPT-4.1 (OpenAI)",
      hint: "Stronger extraction",
    },
    {
      value: "google/gemini-2.5-flash",
      label: "Gemini 2.5 Flash",
      hint: "Very fast, huge context",
    },
    {
      value: "meta-llama/llama-3.3-70b-instruct",
      label: "Llama 3.3 70B Instruct",
      hint: "Open-weights fallback",
    },
  ],
  openai: [
    {
      value: "gpt-4.1-mini",
      label: "GPT-4.1 mini",
      hint: "Recommended default",
    },
    { value: "gpt-4.1", label: "GPT-4.1", hint: "Stronger extraction" },
    { value: "gpt-4.1-nano", label: "GPT-4.1 nano", hint: "Cheapest" },
    { value: "gpt-4o-mini", label: "GPT-4o mini", hint: "Legacy but cheap" },
    { value: "o3-mini", label: "o3-mini", hint: "Reasoning model" },
  ],
  anthropic: [
    {
      value: "claude-sonnet-4-6",
      label: "Claude Sonnet 4.6",
      hint: "Recommended default",
    },
    {
      value: "claude-haiku-4-5-20251001",
      label: "Claude Haiku 4.5",
      hint: "Fastest + cheapest",
    },
    {
      value: "claude-opus-4-7",
      label: "Claude Opus 4.7",
      hint: "Top quality, higher cost",
    },
    {
      value: "claude-sonnet-4-5",
      label: "Claude Sonnet 4.5",
      hint: "Prior gen",
    },
    {
      value: "claude-3-5-sonnet-20241022",
      label: "Claude 3.5 Sonnet",
      hint: "Legacy",
    },
  ],
  google: [
    {
      value: "gemini-2.5-flash",
      label: "Gemini 2.5 Flash",
      hint: "Recommended · fast, cheap",
    },
    {
      value: "gemini-2.5-pro",
      label: "Gemini 2.5 Pro",
      hint: "Stronger reasoning",
    },
    {
      value: "gemini-2.0-flash",
      label: "Gemini 2.0 Flash",
      hint: "Prior gen, very cheap",
    },
    {
      value: "gemini-2.0-flash-lite",
      label: "Gemini 2.0 Flash Lite",
      hint: "Cheapest",
    },
    {
      value: "gemini-1.5-flash",
      label: "Gemini 1.5 Flash",
      hint: "Legacy",
    },
  ],
};

// First entry in each provider's list is treated as its recommended default.
function defaultModelFor(provider: AiProviderT): string {
  return MODELS_BY_PROVIDER[provider][0].value;
}

const PATH_OPTIONS: { value: ProcessingPathT; label: string; hint: string }[] =
  [
    {
      value: "in-app",
      label: "In-app (Vercel AI SDK)",
      hint: "Runs generateObject on the server using the provider + model below.",
    },
    {
      value: "n8n",
      label: "n8n webhook",
      hint: "POSTs to the webhook URL. n8n must return { cards: [...] }.",
    },
  ];

const TEST_TEXT_PLACEHOLDER = `Try something like:
"I need to finish the onboarding doc by Friday and send it to Maya. Also, remind me to renew the SSL cert next week."`;

export function SettingsForm({ initial }: { initial: SettingsValues }) {
  const [saveStatus, setSaveStatus] = useState<
    { kind: "ok" } | { kind: "err"; message: string } | null
  >(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<SettingsValues>({
    resolver: zodResolver(SettingsUpdateInput),
    defaultValues: initial,
  });

  const processingPath = watch("processingPath");
  const aiProvider = watch("aiProvider");
  const aiModel = watch("aiModel");

  const providerModels = MODELS_BY_PROVIDER[aiProvider];
  const isCuratedModel = providerModels.some((m) => m.value === aiModel);
  const modelSelectValue = isCuratedModel ? aiModel : CUSTOM;

  const save = useMutation({
    mutationFn: async (values: SettingsValues) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Save failed");
      return values;
    },
    onSuccess: (values) => {
      reset(values);
      setSaveStatus({ kind: "ok" });
    },
    onError: (e: Error) => setSaveStatus({ kind: "err", message: e.message }),
  });

  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<
    | { kind: "ok"; count: number; first: string | null }
    | { kind: "err"; message: string }
    | null
  >(null);

  const testParse = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText, mode: "solo" }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Parse failed");
      return body.cards as Array<{ task: string }>;
    },
    onSuccess: (cards) => {
      setTestResult({
        kind: "ok",
        count: cards.length,
        first: cards[0]?.task ?? null,
      });
    },
    onError: (e: Error) =>
      setTestResult({ kind: "err", message: e.message }),
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure how Kamotion parses pasted text into cards.
          </p>
        </header>

        <form
          onSubmit={handleSubmit((data) => {
            setSaveStatus(null);
            save.mutate(data);
          })}
          className="flex flex-col gap-8"
        >
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Processing path
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose where AI parsing runs.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Path</Label>
              <Controller
                name="processingPath"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PATH_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                {PATH_OPTIONS.find((o) => o.value === processingPath)?.hint}
              </p>
            </div>

            {processingPath === "n8n" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="n8nWebhookUrl">n8n webhook URL</Label>
                <Input
                  id="n8nWebhookUrl"
                  type="url"
                  placeholder="https://n8n.example.com/webhook/..."
                  {...register("n8nWebhookUrl")}
                />
                {errors.n8nWebhookUrl && (
                  <p className="text-xs text-destructive">
                    {errors.n8nWebhookUrl.message}
                  </p>
                )}
              </div>
            )}
          </section>

          <fieldset
            disabled={processingPath === "n8n"}
            className={cn(
              "flex flex-col gap-8 border-0 p-0 m-0 min-w-0",
              processingPath === "n8n" && "opacity-50",
            )}
          >
            {processingPath === "n8n" && (
              <p className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Disabled while the <strong>n8n</strong> processing path is
                active — prompt and model are owned by your n8n workflow.
                These apply only to the in-app path.
              </p>
            )}
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                AI provider
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Used when processing path is &ldquo;In-app&rdquo;.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Provider</Label>
                <Controller
                  name="aiProvider"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(next: AiProviderT) => {
                        field.onChange(next);
                        // Provider-prefixed IDs (e.g. "anthropic/claude-…") won't
                        // work when hitting Anthropic directly — reset to the
                        // new provider's recommended default when switching.
                        setValue("aiModel", defaultModelFor(next), {
                          shouldDirty: true,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDER_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Model</Label>
                <Select
                  value={modelSelectValue}
                  onValueChange={(next) => {
                    if (next === CUSTOM) {
                      // Only wipe the field if we're leaving a curated option —
                      // otherwise preserve whatever the user has typed so far.
                      if (isCuratedModel) {
                        setValue("aiModel", "", { shouldDirty: true });
                      }
                    } else {
                      setValue("aiModel", next, { shouldDirty: true });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providerModels.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                    <SelectItem value={CUSTOM}>Custom…</SelectItem>
                  </SelectContent>
                </Select>
                {!isCuratedModel && (
                  <Input
                    {...register("aiModel")}
                    placeholder="e.g. anthropic/claude-sonnet-4-6"
                    className="font-mono text-sm"
                    autoFocus
                  />
                )}
                {errors.aiModel && (
                  <p className="text-xs text-destructive">
                    {errors.aiModel.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="aiApiKeyRef">API key env var</Label>
              <Input
                id="aiApiKeyRef"
                {...register("aiApiKeyRef")}
                placeholder="e.g. AI_API_KEY_OPENROUTER"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Name of the environment variable on the server holding the API
                key. The key itself is never stored in the database.
              </p>
              {errors.aiApiKeyRef && (
                <p className="text-xs text-destructive">
                  {errors.aiApiKeyRef.message}
                </p>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                System prompt
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Instructions prepended to every parse request.
              </p>
            </div>
            <Textarea
              id="systemPrompt"
              rows={8}
              {...register("systemPrompt")}
              className="font-mono text-sm"
            />
            {errors.systemPrompt && (
              <p className="text-xs text-destructive">
                {errors.systemPrompt.message}
              </p>
            )}
          </section>
          </fieldset>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="text-xs text-muted-foreground">
              {saveStatus?.kind === "ok" && (
                <span className="inline-flex items-center gap-1.5 text-[color:var(--brand-success)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved.
                </span>
              )}
              {saveStatus?.kind === "err" && (
                <span className="inline-flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {saveStatus.message}
                </span>
              )}
            </div>
            <Button
              type="submit"
              disabled={save.isPending || !isDirty}
              className="cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>

        <section className="mt-12 flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Test parse</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Sends text to <code className="font-mono">/api/ai/parse</code>{" "}
            using your <em>saved</em> configuration. Save any changes first.
          </p>
          <Textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={4}
            placeholder={TEST_TEXT_PLACEHOLDER}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs">
              {testResult?.kind === "ok" && (
                <span className="inline-flex items-center gap-1.5 text-[color:var(--brand-success)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {testResult.count} card{testResult.count === 1 ? "" : "s"}
                  {testResult.first
                    ? ` · first: “${testResult.first}”`
                    : ""}
                </span>
              )}
              {testResult?.kind === "err" && (
                <span className="inline-flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {testResult.message}
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={testParse.isPending || testText.trim().length === 0}
              onClick={() => {
                setTestResult(null);
                testParse.mutate();
              }}
              className="cursor-pointer"
            >
              {testParse.isPending ? "Testing…" : "Run test"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
