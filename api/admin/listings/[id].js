import { ensureSchema, getSql } from "../../../server/db.js";
import { requireAdmin } from "../../../server/auth.js";

export default async function handler(req, res) {
  const admin = requireAdmin(req, res);
  if (!admin) return;

  const id = Number(req.query?.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: "Invalid listing ID." });

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await ensureSchema();
    const sql = getSql();
    const status = String(req.body?.status || "");
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be approved or rejected." });
    }

    const rows = await sql`
      UPDATE listings
      SET status = ${status}, updated_at = NOW(), reviewed_by = ${admin.username}, reviewed_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, category, brand, price, original_price AS "originalPrice", condition, age, city, seller,
                score, image, images, description, status, created_at AS "createdAt", updated_at AS "updatedAt",
                reviewed_by AS "reviewedBy", reviewed_at AS "reviewedAt"
    `;

    if (!rows.length) return res.status(404).json({ error: "Listing not found." });
    return res.status(200).json({
      ...rows[0],
      price: Number(rows[0].price),
      originalPrice: Number(rows[0].originalPrice),
      images: Array.isArray(rows[0].images) ? rows[0].images : [],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to update listing." });
  }
}
