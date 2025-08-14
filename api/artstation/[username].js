export default async function handler(req, res) {
  // CORS + preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const username = String(req.query.username || "").trim().toLowerCase();
  if (!username) return res.status(400).json({ error: "username required" });

  // иногда помогает явная страница ?page=1
  const url = `https://www.artstation.com/users/${username}/projects.json?page=1`;

  try {
    const r = await fetch(url, {
      method: "GET",
      // важные заголовки, чтобы нас приняли за обычный браузер
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": `https://www.artstation.com/${username}`,
        "Origin": "https://www.artstation.com",
        "X-Requested-With": "XMLHttpRequest"
      },
      redirect: "follow",
      cache: "no-store"
    });

    if (!r.ok) {
      // вернем код апстрима, чтобы видеть первопричину
      return res.status(r.status).json({ error: `ArtStation ${r.status}` });
    }

    const data = await r.json();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, max-age=600, stale-while-revalidate=86400"
    );
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: "Upstream fetch failed" });
  }
}
