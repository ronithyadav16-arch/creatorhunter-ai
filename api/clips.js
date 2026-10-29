export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const key = process.env.WAYINVIDEO_API_KEY;
  if (!key) return res.status(503).json({ error: "Clipping API is not configured yet. Add WAYINVIDEO_API_KEY in your hosting provider's server-side environment variables." });
  const headers = { Authorization: `Bearer ${key}`, "x-wayinvideo-api-version": "v2", "Content-Type": "application/json" };
  try {
    if (req.method === "POST") {
      const body = req.body || {};
      if (!body.video_url || typeof body.video_url !== "string") return res.status(400).json({ error: "A valid video URL or uploaded file identity is required." });
      if (body.video_url.length > 4096) return res.status(400).json({ error: "Video source is too long." });
      const payload = {
        video_url: body.video_url,
        project_name: String(body.project_name || "FrameForge AI clips").slice(0, 120),
        target_duration: ["DURATION_0_30","DURATION_0_90","DURATION_30_60","DURATION_60_90","DURATION_90_180"].includes(body.target_duration) ? body.target_duration : "DURATION_30_60",
        limit: Math.max(1, Math.min(20, Number(body.limit) || 5)),
        enable_export: true,
        resolution: "HD_720",
        enable_caption: true,
        caption_display: "original",
        cc_style_tpl: String(body.cc_style_tpl || "temp-7"),
        enable_ai_hook: true,
        ai_hook_script_style: ["serious","casual","informative","conversational","humorous","dramatic","neutral","excited"].includes(body.ai_hook_script_style) ? body.ai_hook_script_style : "conversational",
        ai_hook_position: "beginning",
        enable_ai_reframe: true,
        ratio: "RATIO_9_16"
      };
      const upstream = await fetch("https://wayinvideo-api.wayin.ai/api/v2/clips", { method: "POST", headers, body: JSON.stringify(payload) });
      const data = await upstream.json().catch(() => ({}));
      if (!upstream.ok) return res.status(upstream.status).json({ error: data.message || data.error || data.data?.error_message || "The clipping provider rejected the request.", details: data });
      return res.status(200).json(data);
    }
    const id = String(req.query?.id || "");
    if (!/^[a-zA-Z0-9_-]{3,160}$/.test(id)) return res.status(400).json({ error: "A valid task ID is required." });
    const upstream = await fetch(`https://wayinvideo-api.wayin.ai/api/v2/clips/results/${encodeURIComponent(id)}`, { headers });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return res.status(upstream.status).json({ error: data.message || data.error || "Could not retrieve clip results.", details: data });
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: "Could not reach the clipping provider. Please retry.", details: e?.message || "Network error" });
  }
}