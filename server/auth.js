import crypto from "node:crypto";

function base64url(value) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlJson(value) {
  return base64url(JSON.stringify(value));
}

function signPart(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function createToken(payload, expiresInSeconds = 60 * 60 * 8) {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("ADMIN_JWT_SECRET is not configured");

  const header = base64urlJson({ alg: "HS256", typ: "JWT" });
  const body = base64urlJson({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds });
  const signature = signPart(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token) {
  try {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret || !token) return null;

    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const expected = signPart(`${header}.${body}`, secret);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAdmin(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const user = verifyToken(token);

  if (!user) {
    res.status(401).json({ error: "Administrator authentication required." });
    return null;
  }

  return user;
}
