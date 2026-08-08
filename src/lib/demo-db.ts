/**
 * Local demo database. Runs a real SQLite engine (sql.js) in the browser so
 * generated queries execute for real without any cloud backend.
 */

export type Cell = string | number | boolean | null;

export type QueryResult = {
  columns: string[];
  rows: Record<string, Cell>[];
  rowCount: number;
  durationMs: number;
};

const SEED_SQL = `
CREATE TABLE customers (
  customer_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  signup_date TEXT NOT NULL
);
CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES categories(category_id),
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id TEXT NOT NULL REFERENCES customers(customer_id),
  order_date TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(order_id),
  product_id INTEGER NOT NULL REFERENCES products(product_id),
  quantity INTEGER NOT NULL,
  price REAL NOT NULL
);
CREATE TABLE payments (
  payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(order_id),
  method TEXT NOT NULL,
  amount REAL NOT NULL,
  paid_at TEXT NOT NULL
);
CREATE TABLE reviews (
  review_id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(product_id),
  customer_id TEXT NOT NULL REFERENCES customers(customer_id),
  rating INTEGER NOT NULL,
  comment TEXT
);

INSERT INTO customers (customer_id, name, email, city, country, signup_date) VALUES
('CUST1001','Arjun Mehta','arjun@example.com','Mumbai','India','2023-02-11'),
('CUST1002','Rahul Sharma','rahul@example.com','Delhi','India','2023-04-02'),
('CUST1003','Sneha Iyer','sneha@example.com','Bengaluru','India','2023-05-19'),
('CUST1004','Karan Verma','karan@example.com','Pune','India','2023-07-08'),
('CUST1005','Priya Nair','priya@example.com','Kochi','India','2023-08-23'),
('CUST1006','Ananya Rao','ananya@example.com','Hyderabad','India','2024-01-14'),
('CUST1007','Vikram Singh','vikram@example.com','Jaipur','India','2024-02-27'),
('CUST1008','Meera Joshi','meera@example.com','Ahmedabad','India','2024-03-30');

INSERT INTO categories (name) VALUES ('Electronics'),('Home'),('Books'),('Fashion');

INSERT INTO products (name, category_id, price, stock) VALUES
('Wireless Headphones',1,2499.00,120),
('Mechanical Keyboard',1,5499.00,45),
('4K Monitor',1,18999.00,20),
('Coffee Maker',2,3299.00,60),
('Table Lamp',2,899.00,150),
('SQL Fundamentals',3,749.00,200),
('Data Modeling Guide',3,1099.00,80),
('Cotton T-Shirt',4,599.00,300),
('Running Shoes',4,3199.00,90),
('Smart Watch',1,7999.00,35);

INSERT INTO orders (customer_id, order_date, total_amount, status) VALUES
('CUST1001', date('now','-5 day'), 7998.00, 'delivered'),
('CUST1001', date('now','-40 day'), 18999.00, 'delivered'),
('CUST1002', date('now','-12 day'), 5499.00, 'shipped'),
('CUST1002', date('now','-22 day'), 3299.00, 'delivered'),
('CUST1002', date('now','-70 day'), 1348.00, 'delivered'),
('CUST1003', date('now','-3 day'), 749.00, 'pending'),
('CUST1003', date('now','-33 day'), 3199.00, 'delivered'),
('CUST1004', date('now','-8 day'), 899.00, 'delivered'),
('CUST1005', date('now','-15 day'), 7999.00, 'delivered'),
('CUST1005', date('now','-60 day'), 2499.00, 'cancelled'),
('CUST1006', date('now','-2 day'), 1099.00, 'pending'),
('CUST1007', date('now','-19 day'), 3798.00, 'shipped'),
('CUST1007', date('now','-90 day'), 5499.00, 'delivered'),
('CUST1008', date('now','-27 day'), 18999.00, 'delivered');

INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1,1,2,2499.00),(1,5,1,899.00),
(2,3,1,18999.00),
(3,2,1,5499.00),
(4,4,1,3299.00),
(5,6,1,749.00),(5,5,1,899.00),
(6,6,1,749.00),
(7,9,1,3199.00),
(8,5,1,899.00),
(9,10,1,7999.00),
(10,1,1,2499.00),
(11,7,1,1099.00),
(12,8,2,599.00),(12,4,1,3299.00),
(13,2,1,5499.00),
(14,3,1,18999.00);

INSERT INTO payments (order_id, method, amount, paid_at) VALUES
(1,'upi',7998.00, date('now','-5 day')),
(2,'card',18999.00, date('now','-40 day')),
(3,'card',5499.00, date('now','-12 day')),
(4,'netbanking',3299.00, date('now','-22 day')),
(5,'upi',1348.00, date('now','-70 day')),
(7,'card',3199.00, date('now','-33 day')),
(8,'upi',899.00, date('now','-8 day')),
(9,'card',7999.00, date('now','-15 day')),
(12,'upi',3798.00, date('now','-19 day')),
(13,'card',5499.00, date('now','-90 day')),
(14,'netbanking',18999.00, date('now','-27 day'));

INSERT INTO reviews (product_id, customer_id, rating, comment) VALUES
(1,'CUST1001',5,'Great sound quality'),
(3,'CUST1001',4,'Sharp display'),
(2,'CUST1002',5,'Lovely typing feel'),
(4,'CUST1002',3,'Works fine'),
(6,'CUST1003',5,'Best SQL intro'),
(9,'CUST1003',4,'Comfortable'),
(10,'CUST1005',4,'Good battery'),
(7,'CUST1006',5,'Very practical'),
(8,'CUST1007',3,'Fabric is thin'),
(3,'CUST1008',5,'Worth the price');
`;

type SqlJsDb = {
  exec: (sql: string) => { columns: string[]; values: Cell[][] }[];
};

let dbPromise: Promise<SqlJsDb> | null = null;

async function getDb(): Promise<SqlJsDb> {
  if (typeof window === "undefined") {
    throw new Error("The demo database only runs in the browser.");
  }
  if (!dbPromise) {
    dbPromise = (async () => {
      const { default: initSqlJs } = await import("sql.js");
      const SQL = await initSqlJs({ locateFile: () => "/wasm/sql-wasm.wasm" });
      const db = new SQL.Database() as unknown as SqlJsDb;
      db.exec(SEED_SQL);
      return db;
    })();
  }
  return dbPromise;
}

const FORBIDDEN =
  /\b(insert|update|delete|drop|alter|create|truncate|attach|detach|pragma|replace|vacuum|reindex)\b/i;

/** Executes a single read-only SELECT against the local demo database. */
export async function runReadOnlySql(sql: string): Promise<QueryResult> {
  const cleaned = sql.trim().replace(/;\s*$/, "");
  if (!cleaned) throw new Error("Empty query");
  if (cleaned.includes(";")) throw new Error("Only a single statement is allowed");
  if (!/^(select|with)\s/i.test(cleaned)) throw new Error("Only SELECT queries are allowed");
  if (FORBIDDEN.test(cleaned)) throw new Error("Only read-only SELECT queries are allowed");

  const db = await getDb();
  const started = performance.now();
  const result = db.exec(cleaned);
  const durationMs = Math.max(1, Math.round(performance.now() - started));

  const first = result[0];
  if (!first) return { columns: [], rows: [], rowCount: 0, durationMs };

  const rows = first.values.slice(0, 500).map((values) => {
    const row: Record<string, Cell> = {};
    first.columns.forEach((column, i) => {
      const value = values[i];
      row[column] =
        value === null || value === undefined
          ? null
          : typeof value === "object"
            ? JSON.stringify(value)
            : value;
    });
    return row;
  });

  return { columns: first.columns, rows, rowCount: rows.length, durationMs };
}

export function normalizeRows(rows: Record<string, Cell>[]): string {
  return JSON.stringify(
    rows.map((row) =>
      Object.keys(row)
        .sort()
        .map((k) => String(row[k] ?? "")),
    ),
  );
}
