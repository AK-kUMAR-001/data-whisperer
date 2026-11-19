/**
 * Client-safe database designer model: schema types, auto layout for the ER
 * diagram, DDL generation per dialect, validation and export helpers.
 */

export type Dialect = "MySQL" | "PostgreSQL" | "SQLite";
export const DIALECTS: Dialect[] = ["MySQL", "PostgreSQL", "SQLite"];

export type DesignColumn = {
  name: string;
  type: string;
  pk: boolean;
  nullable: boolean;
  unique: boolean;
  references: { table: string; column: string } | null;
};
export type DesignTable = { name: string; columns: DesignColumn[] };
export type DesignIndex = { table: string; columns: string[]; unique: boolean };
export type DesignSchema = {
  database: string;
  tables: DesignTable[];
  indexes: DesignIndex[];
  views: string[];
  notes: string;
  generatedAt: string;
};

function col(name: string, type: string, extra: Partial<DesignColumn> = {}): DesignColumn {
  return { name, type, pk: false, nullable: true, unique: false, references: null, ...extra };
}
const pk = (name: string) => col(name, "INT", { pk: true, nullable: false });
const fk = (name: string, table: string, nullable = false) =>
  col(name, "INT", { nullable, references: { table, column: name } });
const req = (name: string, type: string) => col(name, type, { nullable: false });

export function defaultSchema(): DesignSchema {
  return {
    database: "ecommerce_db",
    tables: [
      { name: "customers", columns: [pk("customer_id"), req("name", "VARCHAR(100)"), col("email", "VARCHAR(150)", { unique: true, nullable: false }), col("phone", "VARCHAR(20)"), req("created_at", "TIMESTAMP")] },
      { name: "sellers", columns: [pk("seller_id"), req("name", "VARCHAR(100)"), col("email", "VARCHAR(150)", { unique: true, nullable: false }), col("phone", "VARCHAR(20)")] },
      { name: "categories", columns: [pk("category_id"), req("name", "VARCHAR(100)"), col("description", "TEXT")] },
      { name: "products", columns: [pk("product_id"), fk("seller_id", "sellers"), fk("category_id", "categories"), req("name", "VARCHAR(200)"), req("price", "DECIMAL(10,2)"), req("stock", "INT")] },
      { name: "warehouses", columns: [pk("warehouse_id"), req("name", "VARCHAR(100)"), req("city", "VARCHAR(80)")] },
      { name: "inventory", columns: [pk("inventory_id"), fk("product_id", "products"), fk("warehouse_id", "warehouses"), req("stock_quantity", "INT")] },
      { name: "cart", columns: [pk("cart_id"), fk("customer_id", "customers"), req("created_at", "TIMESTAMP")] },
      { name: "cart_items", columns: [pk("cart_item_id"), fk("cart_id", "cart"), fk("product_id", "products"), req("quantity", "INT")] },
      { name: "coupons", columns: [pk("coupon_id"), col("code", "VARCHAR(30)", { unique: true, nullable: false }), req("discount_type", "VARCHAR(20)"), req("discount_value", "DECIMAL(10,2)"), req("valid_from", "DATE"), req("valid_to", "DATE"), req("is_active", "BOOLEAN")] },
      { name: "orders", columns: [pk("order_id"), fk("customer_id", "customers"), fk("coupon_id", "coupons", true), req("order_date", "DATETIME"), req("status", "VARCHAR(20)"), req("total_amount", "DECIMAL(10,2)")] },
      { name: "order_items", columns: [pk("order_item_id"), fk("order_id", "orders"), fk("product_id", "products"), req("quantity", "INT"), req("price", "DECIMAL(10,2)")] },
      { name: "payments", columns: [pk("payment_id"), fk("order_id", "orders"), req("payment_method", "VARCHAR(30)"), req("amount", "DECIMAL(10,2)"), req("payment_status", "VARCHAR(20)")] },
      { name: "reviews", columns: [pk("review_id"), fk("product_id", "products"), fk("customer_id", "customers"), req("rating", "INT"), col("comment", "TEXT")] },
      { name: "shipping_addresses", columns: [pk("address_id"), fk("customer_id", "customers"), req("address1", "VARCHAR(200)"), req("city", "VARCHAR(80)"), req("state", "VARCHAR(80)"), req("pincode", "VARCHAR(12)"), req("country", "VARCHAR(60)")] },
    ],
    indexes: [
      { table: "orders", columns: ["customer_id", "order_date"], unique: false },
      { table: "products", columns: ["category_id"], unique: false },
      { table: "inventory", columns: ["product_id", "warehouse_id"], unique: true },
      { table: "reviews", columns: ["product_id"], unique: false },
    ],
    views: ["v_order_summary", "v_product_stock"],
    notes: "Starter e-commerce design. Describe your own database and press Generate Schema.",
    generatedAt: "2026-01-01T09:00:00.000Z",
  };
}

export function emptySchema(): DesignSchema {
  return { database: "new_db", tables: [], indexes: [], views: [], notes: "", generatedAt: new Date().toISOString() };
}

/* ---------- normalisation of untrusted (AI) input ---------- */

export function ident(value: unknown, fallback = "item"): string {
  const s = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  if (!s) return fallback;
  return /^\d/.test(s) ? `_${s}` : s;
}

function sqlType(value: unknown): string {
  const s = String(value ?? "").trim().toUpperCase();
  return /^[A-Z ]{2,30}(\(\d{1,4}(,\s?\d{1,3})?\))?$/.test(s) ? s.replace(/,\s/, ",") : "VARCHAR(255)";
}

export function normalizeSchema(raw: unknown, generatedAt: string): DesignSchema {
  const r = (raw ?? {}) as Record<string, unknown>;
  const tablesRaw = Array.isArray(r["tables"]) ? (r["tables"] as Record<string, unknown>[]) : [];
  const tables: DesignTable[] = tablesRaw.slice(0, 40).map((t, ti) => {
    const colsRaw = Array.isArray(t["columns"]) ? (t["columns"] as Record<string, unknown>[]) : [];
    return {
      name: ident(t["name"], `table_${ti + 1}`),
      columns: colsRaw.slice(0, 40).map((c, ci) => {
        const ref = c["references"] as Record<string, unknown> | null | undefined;
        return {
          name: ident(c["name"], `column_${ci + 1}`),
          type: sqlType(c["type"]),
          pk: c["pk"] === true,
          nullable: c["pk"] === true ? false : c["nullable"] !== false,
          unique: c["unique"] === true,
          references:
            ref && typeof ref === "object" && ref["table"]
              ? { table: ident(ref["table"]), column: ident(ref["column"], "id") }
              : null,
        };
      }),
    };
  });
  const indexesRaw = Array.isArray(r["indexes"]) ? (r["indexes"] as Record<string, unknown>[]) : [];
  return {
    database: ident(r["database"], "app_db"),
    tables,
    indexes: indexesRaw.slice(0, 60).map((ix) => ({
      table: ident(ix["table"]),
      columns: (Array.isArray(ix["columns"]) ? ix["columns"] : []).map((c) => ident(c)),
      unique: ix["unique"] === true,
    })),
    views: (Array.isArray(r["views"]) ? r["views"] : []).slice(0, 20).map((v) => ident(v, "view")),
    notes: typeof r["notes"] === "string" ? r["notes"].slice(0, 400) : "",
    generatedAt,
  };
}

/* ---------- relationships, layout ---------- */

export type Relation = { from: string; column: string; to: string; toColumn: string };

export function relationsOf(schema: DesignSchema): Relation[] {
  return schema.tables.flatMap((t) =>
    t.columns
      .filter((c) => c.references)
      .map((c) => ({ from: t.name, column: c.name, to: c.references!.table, toColumn: c.references!.column })),
  );
}

export const NODE_W = 170;
export const HEAD_H = 30;
export const ROW_H = 20;
const PAD = 8;
const GAP_X = 44;
const GAP_Y = 44;

export type LayoutNode = { table: DesignTable; x: number; y: number; h: number };
export type Layout = { nodes: LayoutNode[]; width: number; height: number };

export function layoutSchema(schema: DesignSchema, perRow: number): Layout {
  const nodes: LayoutNode[] = [];
  let y = 16;
  for (let i = 0; i < schema.tables.length; i += perRow) {
    const row = schema.tables.slice(i, i + perRow);
    let rowH = 0;
    row.forEach((table, j) => {
      const h = HEAD_H + table.columns.length * ROW_H + PAD;
      rowH = Math.max(rowH, h);
      nodes.push({ table, x: 16 + j * (NODE_W + GAP_X), y, h });
    });
    y += rowH + GAP_Y;
  }
  const cols = Math.min(perRow, Math.max(1, schema.tables.length));
  return { nodes, width: 32 + cols * NODE_W + (cols - 1) * GAP_X, height: Math.max(200, y) };
}

export type Edge = { d: string; from: string; to: string };

export function edgesOf(layout: Layout): Edge[] {
  const byName = new Map(layout.nodes.map((n) => [n.table.name, n]));
  const edges: Edge[] = [];
  for (const child of layout.nodes) {
    child.table.columns.forEach((c, i) => {
      if (!c.references) return;
      const parent = byName.get(c.references.table);
      if (!parent || parent === child) return;
      const y1 = child.y + HEAD_H + 4 + i * ROW_H + ROW_H / 2;
      const y2 = parent.y + HEAD_H / 2;
      let x1: number, x2: number, c1: number, c2: number;
      if (parent.x > child.x) {
        x1 = child.x + NODE_W; x2 = parent.x; c1 = x1 + 40; c2 = x2 - 40;
      } else if (parent.x < child.x) {
        x1 = child.x; x2 = parent.x + NODE_W; c1 = x1 - 40; c2 = x2 + 40;
      } else {
        x1 = child.x; x2 = parent.x; c1 = x1 - 36; c2 = x2 - 36;
      }
      edges.push({ d: `M ${x1} ${y1} C ${c1} ${y1}, ${c2} ${y2}, ${x2} ${y2}`, from: child.table.name, to: parent.table.name });
    });
  }
  return edges;
}

/* ---------- DDL ---------- */

function mapType(type: string, d: Dialect): string {
  const up = type.toUpperCase();
  if (d === "PostgreSQL") {
    if (up === "DATETIME") return "TIMESTAMP";
    if (up === "DOUBLE") return "DOUBLE PRECISION";
    if (up.startsWith("TINYINT")) return "SMALLINT";
    return up;
  }
  if (d === "SQLite") {
    if (/INT/.test(up)) return "INTEGER";
    if (/BOOL/.test(up)) return "INTEGER";
    if (/DEC|NUM|REAL|FLOA|DOUB/.test(up)) return "REAL";
    return "TEXT";
  }
  return up;
}

function sortTables(schema: DesignSchema): DesignTable[] {
  const names = new Set(schema.tables.map((t) => t.name));
  const done = new Set<string>();
  const out: DesignTable[] = [];
  let remaining = [...schema.tables];
  while (remaining.length) {
    const ready = remaining.filter((t) =>
      t.columns.every((c) => !c.references || c.references.table === t.name || done.has(c.references.table) || !names.has(c.references.table)),
    );
    const batch = ready.length ? ready : [remaining[0]!];
    batch.forEach((t) => { out.push(t); done.add(t.name); });
    remaining = remaining.filter((t) => !done.has(t.name));
  }
  return out;
}

export function generateDdl(schema: DesignSchema, dialect: Dialect): string {
  const lines: string[] = [`-- ${schema.database} · ${dialect} DDL generated by Dolphin AI Studio`];
  if (dialect === "MySQL") lines.push(`CREATE DATABASE IF NOT EXISTS ${schema.database};`, `USE ${schema.database};`);
  else if (dialect === "PostgreSQL") lines.push(`-- CREATE DATABASE ${schema.database};`);
  if (schema.tables.length === 0) {
    lines.push("", "-- No tables yet. Describe your database and generate a schema.");
    return lines.join("\n");
  }
  for (const t of sortTables(schema)) {
    const pks = t.columns.filter((c) => c.pk);
    const defs: string[] = t.columns.map((c) => {
      const intish = /INT/i.test(c.type);
      if (c.pk && pks.length === 1 && intish) {
        if (dialect === "MySQL") return `  ${c.name} INT AUTO_INCREMENT PRIMARY KEY`;
        if (dialect === "PostgreSQL") return `  ${c.name} SERIAL PRIMARY KEY`;
        return `  ${c.name} INTEGER PRIMARY KEY AUTOINCREMENT`;
      }
      let def = `  ${c.name} ${mapType(c.type, dialect)}`;
      if (c.pk && pks.length === 1) def += " PRIMARY KEY";
      else if (!c.nullable) def += " NOT NULL";
      if (c.unique && !c.pk) def += " UNIQUE";
      return def;
    });
    if (pks.length > 1) defs.push(`  PRIMARY KEY (${pks.map((c) => c.name).join(", ")})`);
    for (const c of t.columns.filter((c) => c.references)) {
      defs.push(
        `  FOREIGN KEY (${c.name}) REFERENCES ${c.references!.table}(${c.references!.column}) ON DELETE ${c.nullable ? "SET NULL" : "CASCADE"}`,
      );
    }
    lines.push("", `CREATE TABLE ${t.name} (`, defs.join(",\n"), ");");
  }
  if (schema.indexes.length) {
    lines.push("");
    for (const ix of schema.indexes) {
      lines.push(`CREATE ${ix.unique ? "UNIQUE " : ""}INDEX idx_${ix.table}_${ix.columns.join("_")} ON ${ix.table} (${ix.columns.join(", ")});`);
    }
  }
  return lines.join("\n");
}

/* ---------- validation ---------- */

export type Issue = { level: "error" | "warning"; message: string };
export type Validation = {
  issues: Issue[];
  passed: string[];
  stats: { tables: number; columns: number; relationships: number; indexes: number; views: number };
};

export function validateSchema(schema: DesignSchema): Validation {
  const issues: Issue[] = [];
  const tables = new Map<string, DesignTable>();
  for (const t of schema.tables) {
    if (tables.has(t.name)) issues.push({ level: "error", message: `Duplicate table "${t.name}"` });
    tables.set(t.name, t);
  }
  for (const t of schema.tables) {
    if (t.columns.length === 0) issues.push({ level: "error", message: `${t.name} has no columns` });
    if (!t.columns.some((c) => c.pk)) issues.push({ level: "warning", message: `${t.name} has no primary key` });
    const seen = new Set<string>();
    for (const c of t.columns) {
      if (seen.has(c.name)) issues.push({ level: "error", message: `${t.name}.${c.name} is defined twice` });
      seen.add(c.name);
      if (c.references) {
        const target = tables.get(c.references.table);
        if (!target) issues.push({ level: "error", message: `${t.name}.${c.name} references missing table ${c.references.table}` });
        else if (!target.columns.some((tc) => tc.name === c.references!.column))
          issues.push({ level: "error", message: `${t.name}.${c.name} references missing column ${c.references.table}.${c.references.column}` });
      }
    }
  }
  for (const ix of schema.indexes) {
    const t = tables.get(ix.table);
    if (!t) issues.push({ level: "error", message: `Index on missing table ${ix.table}` });
    else for (const c of ix.columns)
      if (!t.columns.some((tc) => tc.name === c)) issues.push({ level: "error", message: `Index column ${ix.table}.${c} does not exist` });
  }
  if (schema.tables.length === 0) issues.push({ level: "warning", message: "No tables yet" });

  const stats = {
    tables: schema.tables.length,
    columns: schema.tables.reduce((n, t) => n + t.columns.length, 0),
    relationships: relationsOf(schema).length,
    indexes: schema.indexes.length,
    views: schema.views.length,
  };
  const passed: string[] = [];
  if (stats.tables) passed.push(`${stats.tables} tables`);
  if (!issues.some((i) => i.message.includes("primary key")) && stats.tables) passed.push("Every table has a key");
  if (!issues.some((i) => i.message.includes("references"))) passed.push(`${stats.relationships} valid relationships`);
  if (!issues.some((i) => i.message.startsWith("Index"))) passed.push(`${stats.indexes} valid indexes`);
  return { issues, passed, stats };
}

/* ---------- exports ---------- */

export function generateDocs(schema: DesignSchema, dialect: Dialect): string {
  const out = [`# ${schema.database}`, "", `Dialect: ${dialect}  `, `Generated: ${new Date(schema.generatedAt).toLocaleString()}`, ""];
  if (schema.notes) out.push(schema.notes, "");
  for (const t of schema.tables) {
    out.push(`## ${t.name}`, "", "| Column | Type | Key | Nullable | References |", "|---|---|---|---|---|");
    for (const c of t.columns) {
      out.push(`| ${c.name} | ${c.type} | ${c.pk ? "PK" : c.references ? "FK" : c.unique ? "UNIQUE" : ""} | ${c.nullable ? "yes" : "no"} | ${c.references ? `${c.references.table}.${c.references.column}` : ""} |`);
    }
    out.push("");
  }
  if (schema.indexes.length) {
    out.push("## Indexes", "");
    schema.indexes.forEach((ix) => out.push(`- ${ix.unique ? "UNIQUE " : ""}${ix.table} (${ix.columns.join(", ")})`));
    out.push("");
  }
  return out.join("\n");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Standalone SVG file of the ER diagram (fixed print colours, not app theme). */
export function generateErSvg(schema: DesignSchema, perRow = 4): string {
  const layout = layoutSchema(schema, perRow);
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" font-family="Arial, sans-serif">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
  ];
  for (const e of edgesOf(layout)) parts.push(`<path d="${e.d}" fill="none" stroke="#94a3b8" stroke-width="1.5"/>`);
  for (const n of layout.nodes) {
    parts.push(
      `<rect x="${n.x}" y="${n.y}" width="${NODE_W}" height="${n.h}" rx="8" fill="#f8fafc" stroke="#334155"/>`,
      `<rect x="${n.x}" y="${n.y}" width="${NODE_W}" height="${HEAD_H}" rx="8" fill="#1e3a8a"/>`,
      `<text x="${n.x + NODE_W / 2}" y="${n.y + 20}" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">${esc(n.table.name)}</text>`,
    );
    n.table.columns.forEach((c, i) => {
      const tag = c.pk ? "PK " : c.references ? "FK " : "";
      parts.push(`<text x="${n.x + 8}" y="${n.y + HEAD_H + 4 + i * ROW_H + 14}" font-size="11" fill="#0f172a">${esc(tag + c.name)}</text>`);
    });
  }
  parts.push("</svg>");
  return parts.join("\n");
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Minimal uncompressed ZIP archive builder. */
export function makeZip(files: { name: string; content: string }[]): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = enc.encode(f.content);
    const crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, data.length, true);
    local.setUint32(22, data.length, true);
    local.setUint16(26, name.length, true);
    chunks.push(new Uint8Array(local.buffer), name, data);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, data.length, true);
    cen.setUint32(24, data.length, true);
    cen.setUint16(28, name.length, true);
    cen.setUint32(42, offset, true);
    central.push(new Uint8Array(cen.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const size = central.reduce((n, c) => n + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, size, true);
  end.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)] as BlobPart[], { type: "application/zip" });
}
