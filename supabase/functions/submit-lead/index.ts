// POST a booking request from the public form. Captcha + per-IP limit, strict validation,
// insert with the service role (the leads table has no public insert policy).
import { admin, allowRate, cors, json, originAllowed, str, turnstileOk } from "../_shared/util.ts";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST" || !originAllowed(req)) return json(req, { error: "forbidden" }, 403);
  if (!(await allowRate(req, "lead", 5, 3600))) return json(req, { error: "too_many" }, 429);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json(req, { error: "bad_json" }, 400); }
  if (!(await turnstileOk(b.captcha, req))) return json(req, { error: "captcha" }, 400);

  try {
    const people = Number(b.people ?? 1);
    if (!Number.isInteger(people) || people < 1 || people > 20) throw new Error("people");
    const from = str(b.date_from, 10), to = str(b.date_to, 10);
    if ((from && !DATE.test(from)) || (to && !DATE.test(to))) throw new Error("date");
    const row = {
      name: str(b.name, 80, 1),
      contact: str(b.contact, 80, 3),
      program_id: str(b.program_id, 40),
      people,
      date_from: from, date_to: to,
      hotel: str(b.hotel, 120),
      wants_media: b.wants_media === true,
      note: str(b.note, 1000),
      lang: b.lang === "ru" ? "ru" : "en",
    };
    const { error } = await admin.from("leads").insert(row);
    if (error) throw error;
    await admin.from("page_events").insert({ session: "server00", event: "lead", value: row.program_id, lang: row.lang });
    await notify(row).catch(() => {});
    return json(req, { ok: true });
  } catch (_e) {
    return json(req, { error: "invalid" }, 400);
  }
});

// optional: ping Nastya in Telegram about a new request (secrets TG_BOT_TOKEN + TG_CHAT_ID)
async function notify(r: Record<string, unknown>) {
  const tok = Deno.env.get("TG_BOT_TOKEN"), chat = Deno.env.get("TG_CHAT_ID");
  if (!tok || !chat) return;
  const text = ["Новая заявка с сайта", `Имя: ${r.name}`, `Контакт: ${r.contact}`, `Программа: ${r.program_id ?? "-"}`,
    `Человек: ${r.people}`, (r.date_from || r.date_to) ? `Даты: ${r.date_from ?? ""} – ${r.date_to ?? ""}` : null,
    r.hotel ? `Отель: ${r.hotel}` : null, r.wants_media ? "Хочет фото/видео" : null, r.note ? `Сообщение: ${r.note}` : null]
    .filter(Boolean).join("\n");
  await fetch(`https://api.telegram.org/bot${tok}/sendMessage`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),   // plain text: no HTML parsing
  });
}
