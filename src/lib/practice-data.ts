/** Static practice problems (previously seeded in the database). */
export type PracticeProblem = {
  id: string;
  number: number;
  difficulty: string;
  topic: string;
  question: string;
  tables: string[];
  hint: string;
  pro_tip: string;
  solution_sql: string;
};

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    id: "p-01",
    number: 1,
    difficulty: "Easy",
    topic: "SELECT",
    question: "List the name and city of every customer.",
    tables: ["customers"],
    hint: "You only need a simple SELECT with two columns.",
    pro_tip: "Selecting only the columns you need keeps queries fast.",
    solution_sql: "SELECT name, city FROM customers",
  },
  {
    id: "p-02",
    number: 2,
    difficulty: "Medium",
    topic: "GROUP BY",
    question: "Show the total number of orders placed by each customer.",
    tables: ["customers", "orders"],
    hint: "Join customers to orders and use COUNT with GROUP BY.",
    pro_tip:
      "Use COUNT(column) to count non-null values. To include customers with no orders, use LEFT JOIN.",
    solution_sql:
      "SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name ORDER BY total_orders DESC",
  },
  {
    id: "p-03",
    number: 3,
    difficulty: "Easy",
    topic: "WHERE",
    question: "Find all products that cost more than 3000.",
    tables: ["products"],
    hint: "Filter rows with a WHERE clause on price.",
    pro_tip: "Numeric comparisons do not need quotes.",
    solution_sql: "SELECT name, price FROM products WHERE price > 3000 ORDER BY price DESC",
  },
  {
    id: "p-04",
    number: 4,
    difficulty: "Medium",
    topic: "JOIN",
    question: "Show each order id with the customer name who placed it.",
    tables: ["orders", "customers"],
    hint: "Join orders to customers on customer_id.",
    pro_tip: "Alias your tables to keep joins readable.",
    solution_sql:
      "SELECT o.order_id, c.name FROM orders o JOIN customers c ON c.customer_id = o.customer_id ORDER BY o.order_id",
  },
  {
    id: "p-05",
    number: 5,
    difficulty: "Medium",
    topic: "AGGREGATE",
    question: "Show the average product price per category name.",
    tables: ["products", "categories"],
    hint: "Join categories and use AVG with GROUP BY.",
    pro_tip: "ROUND(AVG(price), 2) gives cleaner output.",
    solution_sql:
      "SELECT ct.name AS category, ROUND(AVG(p.price),2) AS avg_price FROM products p JOIN categories ct ON ct.category_id = p.category_id GROUP BY ct.name ORDER BY avg_price DESC",
  },
  {
    id: "p-06",
    number: 6,
    difficulty: "Hard",
    topic: "HAVING",
    question: "List customers who placed more than 2 orders.",
    tables: ["customers", "orders"],
    hint: "Use GROUP BY with a HAVING filter on COUNT.",
    pro_tip: "HAVING filters groups, WHERE filters rows.",
    solution_sql:
      "SELECT c.name, COUNT(o.order_id) AS total_orders FROM customers c JOIN orders o ON o.customer_id = c.customer_id GROUP BY c.name HAVING COUNT(o.order_id) > 2 ORDER BY total_orders DESC",
  },
  {
    id: "p-07",
    number: 7,
    difficulty: "Hard",
    topic: "SUBQUERY",
    question: "Find products whose price is above the overall average price.",
    tables: ["products"],
    hint: "Use a scalar subquery with AVG in the WHERE clause.",
    pro_tip: "Scalar subqueries return a single value you can compare against.",
    solution_sql:
      "SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) ORDER BY price DESC",
  },
  {
    id: "p-08",
    number: 8,
    difficulty: "Medium",
    topic: "ORDER BY",
    question: "Show the 5 highest value orders with their status.",
    tables: ["orders"],
    hint: "Sort by total_amount descending and limit the result.",
    pro_tip: "ORDER BY ... DESC LIMIT n is the classic top-N pattern.",
    solution_sql:
      "SELECT order_id, total_amount, status FROM orders ORDER BY total_amount DESC LIMIT 5",
  },
  {
    id: "p-09",
    number: 9,
    difficulty: "Hard",
    topic: "JOIN",
    question: "Show total revenue per product name from order items.",
    tables: ["order_items", "products"],
    hint: "Multiply quantity by price and aggregate per product.",
    pro_tip: "SUM(quantity * price) computes line-level revenue.",
    solution_sql:
      "SELECT p.name, SUM(oi.quantity * oi.price) AS revenue FROM order_items oi JOIN products p ON p.product_id = oi.product_id GROUP BY p.name ORDER BY revenue DESC",
  },
  {
    id: "p-10",
    number: 10,
    difficulty: "Easy",
    topic: "SELECT",
    question: "Show the average rating for each product id.",
    tables: ["reviews"],
    hint: "Group reviews by product_id and use AVG on rating.",
    pro_tip: "AVG ignores NULL ratings.",
    solution_sql:
      "SELECT product_id, ROUND(AVG(rating),2) AS avg_rating FROM reviews GROUP BY product_id ORDER BY avg_rating DESC",
  },
];
