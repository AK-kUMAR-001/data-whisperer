const CLAUSES =
  /\s+(LEFT OUTER JOIN|RIGHT OUTER JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|FULL JOIN|CROSS JOIN|JOIN|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|UNION ALL|UNION)\b/gi;

/** Lightweight formatter: one clause per line, uppercase clause keywords. */
export function formatSql(sql: string): string {
  const flat = sql.replace(/\s+/g, " ").trim();
  if (!flat) return "";
  return flat
    .replace(/^(select|with)\b/i, (m) => m.toUpperCase())
    .replace(CLAUSES, (_m, kw: string) => `\n${kw.toUpperCase()}`)
    .replace(/\s+(AND|OR)\s+/gi, (_m, kw: string) => `\n  ${kw.toUpperCase()} `);
}
