import { createServerFn } from "@tanstack/react-start";
import { Output, streamText, NoObjectGeneratedError } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import {
  generateSqlInputSchema,
  sqlResultSchema,
  SQL_SYSTEM_PROMPT,
  type SqlResult,
} from "@/lib/sql-schema";

export const generateSql = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => generateSqlInputSchema.parse(input))
  .handler(async ({ data }): Promise<SqlResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");

    const gateway = createLovableAiGatewayProvider(apiKey, undefined, {
      structuredOutputs: true,
    });

    const prompt = [
      `Target dialect: ${data.dialect}`,
      data.schemaContext?.trim()
        ? `Existing schema / table context provided by the user:\n${data.schemaContext.trim()}`
        : "No schema was provided — infer sensible table and column names and list them under assumptions.",
      `User request:\n${data.prompt}`,
    ].join("\n\n");

    try {
      const result = streamText({
        model: gateway("google/gemini-3.6-flash"),
        system: SQL_SYSTEM_PROMPT,
        prompt,
        output: Output.object({ schema: sqlResultSchema }),
      });
      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        throw new Error("The AI response could not be parsed. Please try rephrasing your request.");
      }
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("429")) {
        throw new Error("Rate limit reached. Please wait a moment and try again.");
      }
      if (message.includes("402")) {
        throw new Error("AI credits exhausted. Add credits in your workspace settings to continue.");
      }
      throw new Error(message);
    }
  });
