import { ensureSchema, getSql } from "../server/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await ensureSchema();
    const sql = getSql();
    const body = req.body || {};
    if (!body.trackingId || !body.type || !body.title) {
      return res.status(400).json({ error: "trackingId, type and title are required." });
    }

    await sql`
      INSERT INTO activities (tracking_id, type, title, description, fields, amount, status)
      VALUES (
        ${String(body.trackingId)}, ${String(body.type)}, ${String(body.title)},
        ${String(body.description || "")}, ${JSON.stringify(Array.isArray(body.fields) ? body.fields.slice(0, 30) : [])}::jsonb,
        ${Number(body.amount) || 0}, ${String(body.status || "Submitted")}
      )
    `;

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to save activity." });
  }
}
