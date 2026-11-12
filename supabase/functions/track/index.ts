// Anonymous page analytics: no IP, no cookies, no personal data. Allowed event names only.
import { admin, allowRate, cors, json, originAllowed } from "../_shared/util.ts";

const EVENTS = new Set(["view", "path", "tab", "term", "pick", "wa", "tg", "copy", "lang"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST" || !originAllowed(req)) return json(req, { error: "forbidden" }, 403);
  if (!(await allowRate(req, "track", 120, 600))) return json(req, { ok: true }); // drop silently
  try {
    const b = await req.json();
    if (!EVENTS.has(b.event) || typeof b.session !== "string" || !/^[a-zA-Z0-9]{8,32}$/.test(b.session)) throw 0;
    const value = typeof b.value === "string" ? b.value.slice(0, 40) : null;
    await admin.from("page_events").insert({
      session: b.session, event: b.event, value,
      lang: b.lang === "ru" ? "ru" : "en",
      device: b.device === "mobile" ? "mobile" : "desktop",
    });
  } catch { /* ignore bad payloads */ }
  return json(req, { ok: true });
});
