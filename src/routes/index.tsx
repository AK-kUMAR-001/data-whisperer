import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Copy, Download, Database, Info } from "lucide-react";
import { PromptPanel } from "@/components/workspace/PromptPanel";
import { ExplanationPanel } from "@/components/workspace/ExplanationPanel";
import { SqlCode } from "@/components/workspace/SqlCode";
import { generateSql } from "@/lib/sql.functions";
import type { SqlDialect, SqlResult } from "@/lib/sql-schema";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dolphin AI Studio — AI SQL Workspace" },
      {
        name: "description",
        content:
          "Turn plain-language questions into correct SQL with line-by-line AI explanations. An AI SQL workspace for developers and students.",
      },
      { property: "og:title", content: "Dolphin AI Studio — AI SQL Workspace" },
      {
        property: "og:description",
        content:
          "Natural language to SQL with line-by-line explanations, keyword breakdowns, and instant export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const [prompt, setPrompt] = useState("");
  const [dialect, setDialect] = useState<SqlDialect>("PostgreSQL");
  const [schemaContext, setSchemaContext] = useState("");
  const [result, setResult] = useState<SqlResult | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const callGenerate = useServerFn(generateSql);
  const mutation = useMutation({
    mutationFn: (input: { prompt: string; dialect: SqlDialect; schemaContext: string | null }) =>
      callGenerate({ data: input }),
    onSuccess: (data) => {
      setResult(data);
      setActiveLine(null);
    },
  });

  const submit = () => {
    if (prompt.trim().length < 3) return;
    mutation.mutate({
      prompt: prompt.trim(),
      dialect,
      schemaContext: schemaContext.trim() ? schemaContext.trim() : null,
    });
  };

  const copySql = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadSql = () => {
    if (!result) return;
    const blob = new Blob([`-- ${result.title} (${result.dialect})\n\n${result.sql}\n`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${result.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "query"}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Database className="size-4" />
            </span>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">Dolphin AI Studio</h1>
              <p className="label-mono">AI SQL workspace</p>
            </div>
          </div>
          <p className="hidden font-mono text-[11px] text-muted-foreground sm:block">
            generate · explain · export
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-4 px-6 py-6 lg:grid-cols-[minmax(320px,0.85fr)_1.15fr]">
        <div className="flex flex-col gap-4">
          <PromptPanel
            prompt={prompt}
            onPromptChange={setPrompt}
            dialect={dialect}
            onDialectChange={setDialect}
            schemaContext={schemaContext}
            onSchemaContextChange={setSchemaContext}
            onSubmit={submit}
            isLoading={mutation.isPending}
          />

          {mutation.isError && (
            <p className="panel border-destructive/40 px-4 py-3 text-sm text-destructive">
              {mutation.error instanceof Error ? mutation.error.message : "Something went wrong."}
            </p>
          )}

          {result && (
            <section className="panel px-4 py-3">
              <h2 className="label-mono">Summary</h2>
              <p className="mt-1.5 text-sm leading-relaxed">{result.summary}</p>
              {result.assumptions.length > 0 && (
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {result.assumptions.map((assumption) => (
                    <li
                      key={assumption}
                      className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {assumption}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <section className="panel flex flex-col overflow-hidden">
            <header className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <h2 className="label-mono">
                {result ? `${result.title} · ${result.dialect}` : "SQL editor"}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={copySql}
                  disabled={!result}
                  className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:opacity-40"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={downloadSql}
                  disabled={!result}
                  className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:bg-surface hover:text-foreground disabled:opacity-40"
                >
                  <Download className="size-3.5" />
                  .sql
                </button>
              </div>
            </header>
            <div className="min-h-[220px] py-3">
              {result ? (
                <SqlCode sql={result.sql} activeLine={activeLine} onLineHover={setActiveLine} />
              ) : (
                <div className="grid-paper flex h-[220px] items-center justify-center">
                  <p className="rounded-md border border-border bg-card px-4 py-2 font-mono text-xs text-muted-foreground">
                    Ask a question — the SQL appears here
                  </p>
                </div>
              )}
            </div>
          </section>

          {result && (
            <ExplanationPanel
              result={result}
              activeLine={activeLine}
              onLineHover={setActiveLine}
            />
          )}
        </div>
      </main>
    </div>
  );
}
