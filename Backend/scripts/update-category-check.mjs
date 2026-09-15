import pg from "pg";

const pool = new pg.Pool({
  connectionString: "postgresql://postgres:zermae_dev_2026@127.0.0.1:5432/zermae",
});

const constraints = await pool.query(`
  select conname, pg_get_constraintdef(oid) as def
  from pg_constraint
  where conrelid = 'product'::regclass and contype = 'c'
`);
console.log(constraints.rows);

await pool.query(`alter table product drop constraint if exists product_category_check`);
await pool.query(`
  alter table product
  add constraint product_category_check
  check (category in (
    'new-arrivals',
    'saddles',
    'bridles',
    'halters',
    'care',
    'serums',
    'creams',
    'cleansers',
    'body-care'
  ))
`);
console.log("product_category_check updated");

await pool.end();
