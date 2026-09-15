import pg from "pg";

const pool = new pg.Pool({
  connectionString: "postgresql://postgres:zermae_dev_2026@127.0.0.1:5432/zermae",
});

const tables = await pool.query(
  "select table_name from information_schema.tables where table_schema = 'public' order by 1",
);
console.log("tables:", tables.rows.map((row) => row.table_name).join(", "));

const sf = await pool.query("select content from storefront_setting where setting_key = 'default' limit 1");
const content = sf.rows[0]?.content ?? {};
console.log("bestSellerSkus:", JSON.stringify(content.bestSellerSkus));

const products = await pool.query(
  "select sku, title, category, status from product where deleted_at is null order by created_at desc limit 20",
).catch(async () =>
  pool.query("select sku, title, category, status from products where deleted_at is null order by created_at desc limit 20"),
);
console.log("products:", products.rows);

await pool.end();
