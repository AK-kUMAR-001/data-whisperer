# Dolphin AI Studio — To-Do List

## Done

- [x] Design system: "light technical" tokens (paper surfaces, ink text, teal accent, IBM Plex Sans/Mono) in `src/styles.css`
- [x] Server-side Lovable AI gateway helper (`src/lib/ai-gateway.server.ts`)
- [x] AI SQL generation server function with structured output + error handling (`src/lib/sql.functions.ts`)
- [x] Strict schema enforcement on AI output (fixes `line` vs `sql` parsing error)
- [x] Prompt workspace: natural-language input, dialect selector, schema context, example prompts
- [x] Voice input (Web Speech API) with multilingual language selector
- [x] SQL editor panel: syntax highlighting, line numbers, copy SQL, download `.sql`
- [x] AI explanation panel: line-by-line walkthrough + SQL keyword descriptions
- [x] Hover sync between SQL lines and their explanations
- [x] Assumptions/summary surface for AI-inferred tables and columns
- [x] Page metadata (title, description, OG/Twitter tags)

## In Progress / Next Up

- [ ] User authentication: login, register, profile (Lovable Cloud)
- [ ] Saved query history per user
- [ ] AI Database Designer: schema generation from business requirements
- [ ] Conversational schema modification (follow-up prompts, context memory)
- [ ] Validation engine: primary/foreign key checks, missing relationship detection
- [ ] Automatic ER diagram generation with zoom + pan navigation
- [ ] SQL Practice Mode: exercises, AI answer evaluation, instant feedback
- [ ] Export center: SQL script, ER diagram image, project documentation
- [ ] Optional Whisper-based transcription fallback for voice input
