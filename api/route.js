// Travel time between two points. Car, bike and walking come from openrouteservice (key in ORS_KEY);
// public transport comes from the community BVG/VBB service. The key never reaches the browser.
const PROFILES = { car: "driving-car", bike: "cycling-regular", walk: "foot-walking" };
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=86400");
  try {
    const q = req.query || {};
    const from = String(q.from || "").split(",").map(Number), to = String(q.to || "").split(",").map(Number);
    const mode = String(q.mode || "car");
    if (from.length !== 2 || to.length !== 2 || [...from, ...to].some(isNaN)) return res.status(400).json({ error: "from and to must be lon,lat" });
    if (mode === "transit") {
      const p = new URLSearchParams({ "from.latitude": from[1], "from.longitude": from[0], "from.address": "Start", "to.latitude": to[1], "to.longitude": to[0], "to.address": "Ziel", results: "1", stopovers: "false" });
      if (q.depart) p.set("departure", String(q.depart));
      const r = await fetch("https://v6.bvg.transport.rest/journeys?" + p.toString(), { headers: { "User-Agent": "finish-line-study-planner" } });
      if (!r.ok) return res.status(502).json({ error: "transit service " + r.status });
      const j = await r.json(), jr = j.journeys && j.journeys[0];
      if (!jr) return res.status(404).json({ error: "no journey" });
      const legs = jr.legs, a = new Date(legs[0].departure || legs[0].plannedDeparture), b = new Date(legs[legs.length - 1].arrival || legs[legs.length - 1].plannedArrival);
      return res.json({ minutes: Math.round((b - a) / 60000), source: "bvg", lines: legs.filter(l => l.line).map(l => l.line.name) });
    }
    const key = process.env.ORS_KEY;
    if (!key) return res.status(500).json({ error: "ORS_KEY missing" });
    const prof = PROFILES[mode] || PROFILES.car;
    const u = `https://api.openrouteservice.org/v2/directions/${prof}?api_key=${encodeURIComponent(key)}&start=${from[0]},${from[1]}&end=${to[0]},${to[1]}`;
    const r = await fetch(u, { headers: { Accept: "application/geo+json" } });
    if (!r.ok) return res.status(502).json({ error: "routing service " + r.status });
    const j = await r.json(), f = j.features && j.features[0];
    if (!f) return res.status(404).json({ error: "no route" });
    const s = f.properties.summary || {}, c = f.geometry.coordinates, step = Math.max(1, Math.floor(c.length / 120));
    const line = c.filter((_, i) => i % step === 0 || i === c.length - 1).map(p => [Math.round(p[1] * 1e5) / 1e5, Math.round(p[0] * 1e5) / 1e5]);
    return res.json({ minutes: Math.round((s.duration || 0) / 60), km: Math.round((s.distance || 0) / 100) / 10, line, source: "ors" });
  } catch (e) { return res.status(500).json({ error: "failed" }); }
};
