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
    const rows = await sql`
      SELECT id, tracking_id AS "trackingId", type, title, description, fields, amount, status,
             created_at AS "createdAt"
      FROM activities
      ORDER BY created_at DESC
      LIMIT 300
    `;
    return res.status(200).json(rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
      timestamp: new Date(row.createdAt).getTime(),
    })));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to load activity history." });
  }
}
