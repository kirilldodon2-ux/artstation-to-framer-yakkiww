export default async function handler(req, res) {
  // CORS + preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const username = String(req.query.username || "").trim().toLowerCase();
  if (!username) return res.status(400).json({ error: "username required" });

  const url = `https://www.artstation.com/users/${username}/projects.json`;

  try {
    const r = await fetch(url, { headers: { "User-Agent": "artstation-proxy" } });
    if (!r.ok) return res.status(r.status).json({ error: `ArtStation ${r.status}` });
    const data = await r.json();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=3600, max-age=600, stale-while-revalidate=86400");
    return res.status(200).json(data);
  } catch {
    return res.status(502).json({ error: "Upstream fetch failed" });
  }
}
