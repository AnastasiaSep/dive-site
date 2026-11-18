// POST a booking request from the public form. Captcha + per-IP limit, strict validation,
// insert with the service role (the leads table has no public insert policy).
import { admin, allowRate, cors, json, originAllowed, str, turnstileOk } from "../_shared/util.ts";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
// same rules as the form in src/app.js (validate)
const RX = {
  name: /^\p{L}[\p{L}\p{M}'’ʼ` .\-]{0,49}$/u,
  link: /(https?:\/\/|www\.|t\.me\/|(?<![@\p{L}\p{N}._-])[\p{L}\p{N}-]{2,}\.(com|ru|net|org|io|me|info|xyz|top|site|link|ly|su|biz|online|shop|club|app|pro|cc)(?![\p{L}\p{N}]))/iu,
  markup: /[<>{}\\]|\[\/?\w/,
  rude: /(?<!\p{L})(ху[йея]|[её]б[аеуы]|бля|сук[аи](?!\p{L})|мудак|залуп|fuck|shit|cunt|bitch|dick(?!\p{L})|nigg)|пизд|хуй/iu,
  phone: /^\+?\d[\d ()\-]{6,18}\d$/,
  tg: /^(?:@|(?:https?:\/\/)?t\.me\/)?([A-Za-z][A-Za-z0-9_]{4,31})$/,
  email: /^[^\s@<>()]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,}$/,
};
const spam = (v: string, n: number) => new RegExp(`(.)\\1{${n},}`, "u").test(v);
const letters = (v: string) => (v.match(/[\p{L}\p{N}]/gu) || []).length;
const clean = (v: unknown) => String(v ?? "").replace(/[\u0000-\u001f\u007f​-‏‪-‮]/g, " ").replace(/\s+/g, " ").trim();
const cleanNote = (v: unknown) => String(v ?? "").replace(/[\u0000-\u0009\u000b-\u001f\u007f​-‏‪-‮]/g, " ").replace(/\n{3,}/g, "\n\n").trim();
function checkName(v: unknown) {
  const n = clean(v);
  if (!RX.name.test(n) || letters(n) < 2 || spam(n, 3) || RX.rude.test(n)) throw new Error("name");
  return n;
}
function checkContact(v: unknown) {
  const c = clean(v), digits = c.replace(/\D/g, "").length;
  if (!((RX.phone.test(c) && digits >= 8 && digits <= 15) || RX.tg.test(c) || RX.email.test(c))) throw new Error("contact");
  return c.slice(0, 80);
}
function checkHotel(v: unknown) {
  const h = clean(v); if (!h) return null;
  if (h.length > 80 || letters(h) < 2 || RX.markup.test(h) || RX.link.test(h) || spam(h, 5) || RX.rude.test(h)) throw new Error("hotel");
  return h;
}
function checkNote(v: unknown) {
  const n = cleanNote(v); if (!n) return null;
  if (n.length > 500 || RX.markup.test(n) || RX.link.test(n) || spam(n, 11) || RX.rude.test(n)) throw new Error("note");
  return n;
}

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
    const today = new Date().toISOString().slice(0, 10);
    if ((from && from < today) || (from && to && to < from)) throw new Error("date");
    const row = {
      name: checkName(b.name),
      contact: checkContact(b.contact),
      program_id: str(b.program_id, 40),
      people,
      date_from: from, date_to: to,
      hotel: checkHotel(b.hotel),
      wants_media: b.wants_media === true,
      note: checkNote(b.note),
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
