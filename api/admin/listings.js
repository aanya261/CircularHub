import { ensureSchema, getSql } from "../../server/db.js";
import { requireAdmin } from "../../server/auth.js";

export default async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await ensureSchema();
    const sql = getSql();
    const status = String(req.query?.status || "pending");
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid listing status." });
    }

    const rows = await sql`
      SELECT id, name, category, brand, price, original_price AS "originalPrice", condition, age, city, seller,
             score, image, images, description, status, created_at AS "createdAt", updated_at AS "updatedAt"
      FROM listings
      WHERE status = ${status}
      ORDER BY created_at DESC
      LIMIT 200
    `;
    return res.status(200).json(rows.map(normalizeListing));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to load administrator listings." });
  }
}

function normalizeListing(row) {
  return {
    ...row,
    price: Number(row.price),
    originalPrice: Number(row.originalPrice),
    images: Array.isArray(row.images) ? row.images : [],
  };
}
