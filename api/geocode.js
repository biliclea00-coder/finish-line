// Address search for the planner, biased to Berlin. Uses openrouteservice with the server-side key.
module.exports = async (req, res) => {
  try {
    const text = String((req.query || {}).q || "").slice(0, 200).trim();
    if (!text) return res.status(400).json({ error: "q missing" });
    const key = process.env.ORS_KEY;
    if (!key) return res.status(500).json({ error: "ORS_KEY missing" });
    const p = new URLSearchParams({ api_key: key, text, size: "5", "boundary.country": "DE", "focus.point.lon": "13.40", "focus.point.lat": "52.52" });
    const r = await fetch("https://api.openrouteservice.org/geocode/search?" + p.toString());
    if (!r.ok) return res.status(502).json({ error: "search service " + r.status });
    const j = await r.json();
    res.setHeader("Cache-Control", "s-maxage=604800");
    return res.json({ results: (j.features || []).map(f => ({ label: f.properties.label, lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1] })) });
  } catch (e) { return res.status(500).json({ error: "failed" }); }
};
