import { useState } from "react";
import { SqlLine } from "./SqlCode";
import type { SqlResult } from "@/lib/sql-schema";

export function ExplanationPanel({
  result,
  activeLine,
  onLineHover,
}: {
  result: SqlResult;
  activeLine: number | null;
  onLineHover: (index: number | null) => void;
}) {
  const [tab, setTab] = useState<"lines" | "keywords">("lines");

  return (
    <section className="panel flex min-h-0 flex-col">
      <header className="flex items-center gap-1 border-b border-border px-3 py-2">
        {(["lines", "keywords"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`rounded-sm px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.09em] transition-colors ${
              tab === item
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item === "lines" ? "Line by line" : "Keywords"}
          </button>
        ))}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "lines" ? (
          <ol className="divide-y divide-border">
            {result.lines.map((line, index) => (
              <li
                key={index}
                onMouseEnter={() => onLineHover(index)}
                onMouseLeave={() => onLineHover(null)}
                className={`px-4 py-3 transition-colors ${
                  activeLine === index ? "bg-accent" : "hover:bg-surface"
                }`}
              >
                <pre className="overflow-x-auto whitespace-pre font-mono text-xs">
                  <SqlLine line={line.sql} />
                </pre>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {line.explanation}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <dl className="divide-y divide-border">
            {result.keywords.map((keyword) => (
              <div key={keyword.keyword} className="px-4 py-3">
                <dt className="font-mono text-xs font-semibold text-code-keyword">
                  {keyword.keyword}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {keyword.description}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
