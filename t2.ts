import { Output, streamText, NoObjectGeneratedError } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { sqlResultSchema, SQL_SYSTEM_PROMPT } from "@/lib/sql-schema";
const g = createLovableAiGatewayProvider(process.env.LOVABLE_API_KEY!);
try {
  const r = streamText({ model: g("google/gemini-3.6-flash"), system: SQL_SYSTEM_PROMPT, prompt: "Target dialect: PostgreSQL\n\nUser request:\nTop 5 customers by order value in last 90 days", output: Output.object({ schema: sqlResultSchema }) });
  console.log(JSON.stringify(await r.output).slice(0,300));
} catch (e:any) {
  console.log("ERR", e.name, e.message?.slice(0,300));
  if (NoObjectGeneratedError.isInstance(e)) console.log("TEXT>>>", String(e.text).slice(0,1500));
}
