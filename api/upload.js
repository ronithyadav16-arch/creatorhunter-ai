export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const key = process.env.WAYINVIDEO_API_KEY;
  if (!key) return res.status(503).json({ error: "Clipping API is not configured yet. Add WAYINVIDEO_API_KEY to your hosting provider's server-side environment variables." });
  const name = String(req.body?.name || "");
  if (!name || name.length > 180 || !/\.(mp4|mov|webm|avi)$/i.test(name)) return res.status(400).json({ error: "Choose an MP4, MOV, WebM, or AVI video file." });
  try {
    const upstream = await fetch("https://wayinvideo-api.wayin.ai/api/v2/upload/single-file", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "x-wayinvideo-api-version": "v2", "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return res.status(upstream.status).json({ error: payload.message || payload.error || "Could not prepare video upload.", details: payload });
    const data = payload.data || {};
    if (!data.upload_url || !data.identity) return res.status(502).json({ error: "The provider returned an incomplete upload response." });
    return res.status(200).json({ upload_url: data.upload_url, identity: data.identity });
  } catch (e) {
    return res.status(502).json({ error: "Could not prepare upload.", details: e?.message || "Network error" });
  }
}