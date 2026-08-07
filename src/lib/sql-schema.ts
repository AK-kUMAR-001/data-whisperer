import { z } from "zod";

export const SQL_DIALECTS = ["MySQL", "PostgreSQL"] as const;
export type SqlDialect = (typeof SQL_DIALECTS)[number];

export const sqlResultSchema = z.object({
  title: z.string(),
  dialect: z.string(),
  sql: z.string(),
  summary: z.string(),
  lines: z.array(
    z.object({
      sql: z.string(),
      explanation: z.string(),
    }),
  ),
  keywords: z.array(
    z.object({
      keyword: z.string(),
      description: z.string(),
    }),
  ),
  assumptions: z.array(z.string()),
});

export type SqlResult = z.infer<typeof sqlResultSchema>;

export const generateSqlInputSchema = z.object({
  prompt: z.string().min(3).max(4000),
  dialect: z.enum(SQL_DIALECTS),
  schemaContext: z.string().max(6000).nullable(),
});

export type GenerateSqlInput = z.infer<typeof generateSqlInputSchema>;

export const SQL_SYSTEM_PROMPT = `You are Dolphin AI Studio, an expert SQL engineer and patient SQL tutor.

Given a natural-language request (which may be in English or another language), produce:
- title: a short label (max 6 words) for the query, in English.
- dialect: the SQL dialect you targeted.
- sql: one complete, correctly formatted, runnable SQL statement (or a short script when the request needs it). Use the target dialect's syntax, uppercase keywords, and 2-space indentation. Never wrap it in markdown fences.
- summary: 1-2 sentences in plain language describing what the SQL does.
- lines: a line-by-line walkthrough. Split the SQL exactly as written into its lines (skip blank lines) and explain each line in plain language. Keep the "sql" field of every entry byte-identical to that line of the sql field.
- keywords: every distinct SQL keyword, clause or function used, with a one-sentence beginner-friendly description.
- assumptions: any table names, column names, or business rules you had to assume. Empty array if none.

The SQL is never executed, so favour clarity and correctness. Answer explanations in the same language the user wrote in.`;
