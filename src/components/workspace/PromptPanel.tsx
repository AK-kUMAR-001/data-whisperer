import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Sparkles, Loader2 } from "lucide-react";
import { SQL_DIALECTS, type SqlDialect } from "@/lib/sql-schema";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "es-ES", label: "Español" },
];

const EXAMPLES = [
  "Show the top 5 customers by total order value in the last 90 days",
  "List employees who earn more than their department average",
  "Add a column for phone number to the users table with a unique constraint",
];

export function PromptPanel({
  prompt,
  onPromptChange,
  dialect,
  onDialectChange,
  schemaContext,
  onSchemaContextChange,
  onSubmit,
  isLoading,
}: {
  prompt: string;
  onPromptChange: (value: string) => void;
  dialect: SqlDialect;
  onDialectChange: (value: SqlDialect) => void;
  schemaContext: string;
  onSchemaContextChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  const [language, setLanguage] = useState("en-US");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    setVoiceSupported(Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition));
  }, []);

  const toggleVoice = () => {
    const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i]?.[0]?.transcript ?? "";
      }
      onPromptChange(prompt ? `${prompt.trim()} ${transcript}` : transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <section className="panel flex flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="label-mono">Prompt workspace</h2>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="rounded-sm border border-input bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground outline-none focus:border-ring"
            aria-label="Voice input language"
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <select
            value={dialect}
            onChange={(event) => onDialectChange(event.target.value as SqlDialect)}
            className="rounded-sm border border-input bg-card px-2 py-1 font-mono text-[11px] text-foreground outline-none focus:border-ring"
            aria-label="SQL dialect"
          >
            {SQL_DIALECTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <textarea
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) onSubmit();
          }}
          placeholder="Describe what you want in plain language…"
          rows={5}
          className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70 focus:border-ring"
        />

        <details className="group">
          <summary className="label-mono cursor-pointer list-none hover:text-foreground">
            + Table / schema context (optional)
          </summary>
          <textarea
            value={schemaContext}
            onChange={(event) => onSchemaContextChange(event.target.value)}
            placeholder="orders(id, customer_id, total, created_at)&#10;customers(id, name, email)"
            rows={4}
            className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs outline-none placeholder:text-muted-foreground/60 focus:border-ring"
          />
        </details>

        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onPromptChange(example)}
              className="max-w-full truncate rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || prompt.trim().length < 3}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isLoading ? "Generating…" : "Generate SQL"}
          </button>
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              className={`inline-flex size-9 items-center justify-center rounded-md border transition-colors ${
                listening
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-input bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
          )}
        </div>
        <p className="label-mono">⌘/Ctrl + Enter to generate</p>
      </div>
    </section>
  );
}
