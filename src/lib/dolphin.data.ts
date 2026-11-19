/**
 * Local data layer — replaces the cloud database. Query history and practice
 * attempts persist in the browser; queries run against the local demo SQLite
 * database. Signatures mirror the previous server functions so call sites keep
 * the `{ data: ... }` shape.
 */
import { normalizeRows, runReadOnlySql, type Cell } from "./demo-db";
import { PRACTICE_PROBLEMS } from "./practice-data";

export type HistoryRow = {
  id: string;
  prompt: string;
  sql: string;
  row_count: number;
  duration_ms: number;
  status: string;
  error: string | null;
  created_at: string;
};

type Attempt = { problem_id: string; is_correct: boolean };

const HISTORY_KEY = "dolphin.history";
const ATTEMPTS_KEY = "dolphin.attempts";
const BOOKMARKS_KEY = "dolphin.bookmarks";
const PENDING_KEY = "dolphin.pendingQuery";

/** Fired on window whenever locally stored data changes. */
export const DATA_EVENT = "dolphin:data-changed";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, rows: T[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(rows.slice(0, 200)));
    window.dispatchEvent(new Event(DATA_EVENT));
  } catch {
    /* storage full or unavailable — history is best-effort */
  }
}

function addHistory(row: Omit<HistoryRow, "id" | "created_at">) {
  write(HISTORY_KEY, [
    { ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() },
    ...read<HistoryRow>(HISTORY_KEY),
  ]);
}

export async function runQuery({ data }: { data: { sql: string; prompt?: string } }) {
  const prompt = data.prompt || "(manual SQL)";
  try {
    const result = await runReadOnlySql(data.sql);
    addHistory({
      prompt,
      sql: data.sql,
      row_count: result.rowCount,
      duration_ms: result.durationMs,
      status: "success",
      error: null,
    });
    return { ok: true as const, error: null as string | null, ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Query failed";
    addHistory({
      prompt,
      sql: data.sql,
      row_count: 0,
      duration_ms: 0,
      status: "error",
      error: message,
    });
    return {
      ok: false as const,
      error: message,
      columns: [] as string[],
      rows: [] as Record<string, Cell>[],
      rowCount: 0,
      durationMs: 0,
    };
  }
}

export async function listHistory(): Promise<HistoryRow[]> {
  return read<HistoryRow>(HISTORY_KEY);
}

export async function listProblems() {
  return PRACTICE_PROBLEMS.map(({ solution_sql: _solution, ...problem }) => problem);
}

function findProblem(id: string) {
  const problem = PRACTICE_PROBLEMS.find((p) => p.id === id);
  if (!problem) throw new Error("Problem not found");
  return problem;
}

export async function getExpectedOutput({ data }: { data: { problemId: string } }) {
  return runReadOnlySql(findProblem(data.problemId).solution_sql);
}

export async function checkAnswer({ data }: { data: { problemId: string; sql: string } }) {
  const problem = findProblem(data.problemId);
  const attempts = read<Attempt>(ATTEMPTS_KEY);

  try {
    const attempt = await runReadOnlySql(data.sql);
    const expected = await runReadOnlySql(problem.solution_sql);
    const isCorrect = normalizeRows(attempt.rows) === normalizeRows(expected.rows);
    write(ATTEMPTS_KEY, [{ problem_id: problem.id, is_correct: isCorrect }, ...attempts]);
    return { ok: true as const, isCorrect, error: null as string | null, ...attempt };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Query failed";
    write(ATTEMPTS_KEY, [{ problem_id: problem.id, is_correct: false }, ...attempts]);
    return {
      ok: false as const,
      isCorrect: false,
      error: message,
      columns: [] as string[],
      rows: [] as Record<string, Cell>[],
      rowCount: 0,
      durationMs: 0,
    };
  }
}

export async function getProgress() {
  const solved = new Set(
    read<Attempt>(ATTEMPTS_KEY)
      .filter((a) => a.is_correct)
      .map((a) => a.problem_id),
  ).size;
  return { solved, total: PRACTICE_PROBLEMS.length };
}

export async function getSolvedIds(): Promise<string[]> {
  return [
    ...new Set(
      read<Attempt>(ATTEMPTS_KEY)
        .filter((a) => a.is_correct)
        .map((a) => a.problem_id),
    ),
  ];
}

export function deleteHistory(id: string) {
  write(
    HISTORY_KEY,
    read<HistoryRow>(HISTORY_KEY).filter((r) => r.id !== id),
  );
}

export function clearHistory() {
  write(HISTORY_KEY, []);
}

export function resetProgress() {
  write(ATTEMPTS_KEY, []);
}

export function getBookmarks(): string[] {
  return read<string>(BOOKMARKS_KEY);
}

export function toggleBookmark(id: string): string[] {
  const current = read<string>(BOOKMARKS_KEY);
  const next = current.includes(id) ? current.filter((b) => b !== id) : [id, ...current];
  write(BOOKMARKS_KEY, next);
  return next;
}

/** Hand a query from another page (e.g. History) to the Workspace. */
export function setPendingQuery(q: { prompt: string; sql: string }) {
  window.localStorage.setItem(PENDING_KEY, JSON.stringify(q));
}

export function takePendingQuery(): { prompt: string; sql: string } | null {
  const raw = window.localStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  window.localStorage.removeItem(PENDING_KEY);
  try {
    return JSON.parse(raw) as { prompt: string; sql: string };
  } catch {
    return null;
  }
}
