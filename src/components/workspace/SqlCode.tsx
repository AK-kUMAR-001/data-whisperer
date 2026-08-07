const KEYWORDS = new Set(
  [
    "select","from","where","and","or","not","null","is","in","like","between","order","by","group","having","limit","offset","join","inner","left","right","full","outer","cross","on","as","distinct","union","all","insert","into","values","update","set","delete","create","table","alter","add","drop","primary","key","foreign","references","unique","default","check","constraint","index","view","with","case","when","then","else","end","asc","desc","exists","cast","int","integer","bigint","serial","varchar","text","boolean","date","timestamp","decimal","numeric","auto_increment","if","begin","commit","returning","using","over","partition","recursive","truncate","explain",
  ],
);

const FUNCTIONS = new Set(
  ["count","sum","avg","min","max","coalesce","now","current_date","current_timestamp","round","upper","lower","concat","length","substring","rank","row_number","dense_rank","abs","date_trunc","extract","string_agg","group_concat","json_agg"],
);

type Token = { text: string; kind: string };

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const re = /(--[^\n]*)|('(?:[^']|'')*')|("(?:[^"]|"")*")|(`[^`]*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_])/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(line)) !== null) {
    const [text, comment, single, double, backtick, num, word, space] = match;
    if (comment) tokens.push({ text, kind: "comment" });
    else if (single || double || backtick) tokens.push({ text, kind: "string" });
    else if (num) tokens.push({ text, kind: "number" });
    else if (word) {
      const lower = word.toLowerCase();
      tokens.push({
        text,
        kind: KEYWORDS.has(lower) ? "keyword" : FUNCTIONS.has(lower) ? "function" : "plain",
      });
    } else if (space) tokens.push({ text, kind: "plain" });
    else tokens.push({ text, kind: "punctuation" });
  }
  return tokens;
}

const CLASS_BY_KIND: Record<string, string> = {
  keyword: "text-code-keyword font-semibold",
  string: "text-code-string",
  number: "text-code-number",
  comment: "text-code-comment italic",
  function: "text-code-function",
  punctuation: "text-code-punctuation",
  plain: "",
};

export function SqlLine({ line }: { line: string }) {
  return (
    <>
      {tokenize(line).map((token, index) => (
        <span key={index} className={CLASS_BY_KIND[token.kind]}>
          {token.text}
        </span>
      ))}
    </>
  );
}

export function SqlCode({
  sql,
  activeLine,
  onLineHover,
}: {
  sql: string;
  activeLine?: number | null;
  onLineHover?: (index: number | null) => void;
}) {
  const lines = sql.replace(/\t/g, "  ").split("\n");

  return (
    <div className="overflow-x-auto font-mono text-[13px] leading-6">
      {lines.map((line, index) => (
        <div
          key={index}
          onMouseEnter={() => onLineHover?.(index)}
          onMouseLeave={() => onLineHover?.(null)}
          className={`flex gap-4 px-4 transition-colors ${
            activeLine === index ? "bg-accent" : "hover:bg-surface"
          }`}
        >
          <span className="w-6 shrink-0 select-none text-right text-muted-foreground/60">
            {index + 1}
          </span>
          <pre className="whitespace-pre">
            <SqlLine line={line} />
          </pre>
        </div>
      ))}
    </div>
  );
}
