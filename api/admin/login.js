import { createToken } from "../../server/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, password } = req.body || {};
    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username !== expectedUsername || password !== expectedPassword) {
      return res.status(401).json({ error: "Invalid administrator credentials." });
    }

    const token = createToken({ role: "admin", username: expectedUsername });
    return res.status(200).json({ token, username: expectedUsername });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to sign in." });
  }
}
