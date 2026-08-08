import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const promptSchema = z.object({
  prompt: z.string().min(3).max(2000),
  language: z.string().min(2).max(40).default("English"),
});

export const generateSql = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => promptSchema.parse(input))
  .handler(async ({ data }) => {
    const { generateSqlFromPrompt } = await import("./dolphin.server");
    return generateSqlFromPrompt(data.prompt, data.language);
  });

export const explainQuery = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ sql: z.string().min(3).max(5000) }).parse(input))
  .handler(async ({ data }) => {
    const { explainSql } = await import("./dolphin.server");
    return { explanation: await explainSql(data.sql) };
  });
