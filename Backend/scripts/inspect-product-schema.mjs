import pg from "pg";
import { randomUUID } from "crypto";

const pool = new pg.Pool({
  connectionString: "postgresql://postgres:zermae_dev_2026@127.0.0.1:5432/zermae",
});

const cols = await pool.query(
  `select column_name, data_type from information_schema.columns
   where table_name = 'product' order by ordinal_position`,
);
console.log(cols.rows);

const imgCols = await pool.query(
  `select column_name from information_schema.columns where table_name = 'product_image' order by ordinal_position`,
);
console.log("product_image", imgCols.rows.map((r) => r.column_name));

await pool.end();
