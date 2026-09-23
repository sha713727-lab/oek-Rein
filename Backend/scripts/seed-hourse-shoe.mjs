import { randomUUID } from "crypto";
import pg from "pg";

import { databaseUrl } from "./db-url.mjs";

const pool = new pg.Pool({
  connectionString: databaseUrl(),
});

const PRODUCTS = [
  {
    sku: "ZM-SAD-001",
    title: "Western Floral Saddle",
    slug: "western-floral-saddle",
    category: "saddles",
    price: 450000,
    description: "Hand-tooled chestnut leather with silver conchos — built for comfort and show-ready presence.",
    image: "/assets/images/western_floral_saddle.png",
    alt: "Saddlera Western Floral Saddle",
    includes: "Full",
  },
  {
    sku: "ZM-BRI-001",
    title: "Western Floral Bridle",
    slug: "western-floral-bridle",
    category: "bridles",
    price: 85000,
    description: "Tooled chestnut leather with silver floral concho and matching coiled reins.",
    image: "/assets/images/western_floral_bridle.png",
    alt: "Saddlera Western Floral Bridle",
    includes: "Full",
  },
  {
    sku: "ZM-SHO-001",
    title: "Hourse Shoe",
    slug: "hourse-shoe",
    category: "new-arrivals",
    price: 12000,
    description: "Precision steel horseshoes with matching nails — stamped and ready for the forge.",
    image: "/assets/images/hourse_shoe.png",
    alt: "Saddlera Hourse Shoe",
    includes: "Pair",
  },
];

const client = await pool.connect();
try {
  await client.query("begin");

  for (const item of PRODUCTS) {
    const existing = await client.query("select id from product where sku = $1 limit 1", [item.sku]);
    let productId = existing.rows[0]?.id;
    if (!productId) {
      productId = randomUUID();
      await client.query(
        `insert into product (
           id, title, slug, sku, category, price, original_price, discount, discount_type,
           description_intro, description_detail, description_highlights,
           spec_composition, spec_care, spec_includes, return_policy, sizes, tile_color,
           best_seller, stock, status
         ) values (
           $1,$2,$3,$4,$5,$6,null,0,'percentage',$7,$7,'{}',$8,$9,$10,$11,'{}',null,true,80,'published'
         )`,
        [
          productId,
          item.title,
          item.slug,
          item.sku,
          item.category,
          item.price,
          item.description,
          "",
          "",
          item.includes,
          "Unused items may be exchanged within 14 days of delivery.",
        ],
      );
      console.log("created", item.sku);
    } else {
      await client.query(
        `update product set
           title = $2, slug = $3, category = $4, price = $5,
           description_intro = $6, description_detail = $6,
           spec_includes = $7, best_seller = true, status = 'published', deleted_at = null
         where id = $1`,
        [productId, item.title, item.slug, item.category, item.price, item.description, item.includes],
      );
      console.log("updated", item.sku);
    }

    await client.query("delete from product_image where product_id = $1", [productId]);
    await client.query(
      `insert into product_image (id, product_id, url, alt, sort_order)
       values ($1, $2, $3, $4, 0)`,
      [randomUUID(), productId, item.image, item.alt],
    );
  }

  const sf = await client.query("select content from storefront_setting where setting_key = 'default'");
  const content = sf.rows[0]?.content ?? {};
  content.bestSellerSkus = PRODUCTS.map((item) => item.sku);
  await client.query("update storefront_setting set content = $1::jsonb where setting_key = 'default'", [
    JSON.stringify(content),
  ]);
  console.log("storefront bestSellerSkus =>", content.bestSellerSkus);

  await client.query("commit");
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}
