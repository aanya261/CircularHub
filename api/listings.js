import { ensureSchema, getSql } from "../server/db.js";

export default async function handler(req, res) {
  try {
    await ensureSchema();
    const sql = getSql();

    if (req.method === "GET") {
      const rows = await sql`
        SELECT id, name, category, brand, price, original_price AS "originalPrice",
               condition, age, city, seller, score, image, images, description, status,
               created_at AS "createdAt", updated_at AS "updatedAt"
        FROM listings
        WHERE status = 'approved'
        ORDER BY created_at DESC
        LIMIT 100
      `;
      return res.status(200).json(rows.map(normalizeListing));
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const required = ["name", "category", "brand", "price", "seller", "city", "description"];
      const missing = required.filter((key) => body[key] === undefined || body[key] === "");
      if (missing.length) return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });

      const price = Number(body.price) || 0;
      const originalPrice = Number(body.originalPrice) || price;
      const images = Array.isArray(body.images) ? body.images.map(String).slice(0, 5) : [];

      const rows = await sql`
        INSERT INTO listings
          (name, category, brand, price, original_price, condition, age, city, seller, score, image, images, description, status)
        VALUES
          (${String(body.name)}, ${String(body.category)}, ${String(body.brand)}, ${price}, ${originalPrice},
           ${String(body.condition || "Good")}, ${String(body.age || "1 year")}, ${String(body.city || "Mumbai")},
           ${String(body.seller)}, ${Number(body.score) || 86}, ${String(body.image || "")}, ${JSON.stringify(images)}::jsonb,
           ${String(body.description)}, 'pending')
        RETURNING id, name, category, brand, price, original_price AS "originalPrice", condition, age, city, seller,
                  score, image, images, description, status, created_at AS "createdAt", updated_at AS "updatedAt"
      `;

      return res.status(201).json(normalizeListing(rows[0]));
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to access listings." });
  }
}

function normalizeListing(row) {
  return {
    ...row,
    price: Number(row.price),
    originalPrice: Number(row.originalPrice),
    images: Array.isArray(row.images) ? row.images : [],
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  };
}
