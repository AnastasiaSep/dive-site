/* Admin panel. Everything shown here is ALSO enforced in the database (RLS + is_admin()).
   Hiding a button in this file is convenience only: a non-admin who edits this script
   still gets "permission denied" from the server. */
"use strict";
const C = window.SITE_CONFIG || {};
const $ = id => document.getElementById(id);
const sb = supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, {
  auth: { persistSession: true, storage: window.sessionStorage, autoRefreshToken: true, detectSessionInUrl: false },
});
const IDLE_MS = 30 * 60 * 1000;

/* ---------- small DOM helper: text only, never innerHTML with data ---------- */
function el(tag, props, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (k === "class") n.className = v;
    else if (k === "data") Object.entries(v).forEach(([a, b]) => n.dataset[a] = b);
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined) n.append(c instanceof Node ? c : String(c));
  return n;
}
function table(id, head, rows) {
  const t = $(id); t.replaceChildren(el("tr", {}, head.map(h => el("th", {}, h))), ...rows);
  if (!rows.length) t.append(el("tr", {}, el("td", { colspan: head.length, class: "small" }, "Пока пусто")));
}
const fmt = d => d ? new Date(d).toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
const day = d => d ? new Date(d + "T00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "";
function fail(e) { alertBox(e && e.message ? e.message : "Ошибка"); }
function alertBox(msg) { const p = el("p", { class: "err" }, msg); document.querySelector("main").prepend(p); setTimeout(() => p.remove(), 6000); }

/* ---------- auth flow: password → TOTP (aal2) → server says is_admin ---------- */
function show(id) { ["login", "mfa", "app"].forEach(x => $(x).hidden = x !== id); $("logout").hidden = id === "login"; }

async function route() {
  if (!C.SUPABASE_URL) { document.querySelector("main").replaceChildren(el("p", { class: "card narrow" }, "Заполни config.js (см. README).")); return; }
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return show("login");
  const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal.currentLevel !== "aal2") return startMfa();
  const { data: ok, error } = await sb.rpc("is_admin");
  if (error || ok !== true) { await sb.auth.signOut(); show("login"); $("l-err").textContent = "У этого аккаунта нет прав администратора."; return; }
  show("app"); open("dash");
}

$("login").addEventListener("submit", async e => {
  e.preventDefault(); $("l-err").textContent = "";
  const { error } = await sb.auth.signInWithPassword({ email: $("l-email").value.trim(), password: $("l-pass").value });
  $("l-pass").value = "";
  if (error) { $("l-err").textContent = "Неверный e-mail или пароль."; return; }
  route();
});

let factorId = null;
async function startMfa() {
  show("mfa"); $("m-err").textContent = ""; $("m-code").value = "";
  const { data } = await sb.auth.mfa.listFactors();
  const verified = (data?.totp || []).find(f => f.status === "verified");
  if (verified) { factorId = verified.id; $("enrol").hidden = true; $("m-code").focus(); return; }
  for (const f of (data?.all || []).filter(f => f.status !== "verified")) await sb.auth.mfa.unenroll({ factorId: f.id });
  const { data: en, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "admin-" + Date.now() });
  if (error) { $("m-err").textContent = error.message; return; }
  factorId = en.id; $("qr").src = en.totp.qr_code; $("secret").textContent = "Ключ вручную: " + en.totp.secret; $("enrol").hidden = false;
}
$("mfa").addEventListener("submit", async e => {
  e.preventDefault(); $("m-err").textContent = "";
  const { error } = await sb.auth.mfa.challengeAndVerify({ factorId, code: $("m-code").value.trim() });
  if (error) { $("m-err").textContent = "Код не подошёл. Проверь время на телефоне."; return; }
  $("enrol").hidden = true; route();
});
async function logout() { await sb.auth.signOut(); location.reload(); }
$("logout").addEventListener("click", logout);
let idle; const bump = () => { clearTimeout(idle); idle = setTimeout(logout, IDLE_MS); };
["click", "keydown"].forEach(ev => document.addEventListener(ev, bump)); bump();

/* ---------- views ---------- */
const loaders = { dash: loadDash, leads: loadLeads, content: loadProgs, invites: loadInvites, users: loadUsers, log: loadLog };
function open(v) {
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-selected", b.dataset.view === v));
  document.querySelectorAll(".view").forEach(s => s.hidden = s.id !== "v-" + v);
  loaders[v]().catch(fail);
}
document.querySelector(".tabs").addEventListener("click", e => { const b = e.target.closest("[data-view]"); if (b) open(b.dataset.view); });

/* dashboard */
$("d-days").addEventListener("change", () => loadDash().catch(fail));
async function loadDash() {
  const { data: d, error } = await sb.rpc("dashboard", { p_days: Number($("d-days").value) });
  if (error) throw error;
  const conv = d.visitors ? Math.round(100 * (d.wa_clicks + d.leads) / d.visitors) : 0;
  $("tiles").replaceChildren(...[
    [d.visitors, "посетителей"], [d.wa_clicks, "кликов «написать»"], [d.leads, "заявок с сайта"],
    [d.booked, "записались"], [conv + "%", "из посетителей написали"], [(d.mobile_share ?? 0) + "%", "с телефона"], [(d.ru_share ?? 0) + "%", "на русском"],
  ].map(([n, l]) => el("div", { class: "tile" }, el("b", {}, n ?? 0), el("span", {}, l))));
  drawChart(d.by_day || []);
  table("top", ["Программа", "Нажали «Записаться»"], (d.top_programs || []).map(r => el("tr", {}, el("td", {}, r.id), el("td", {}, r.picks))));
  const names = { first: "Ни разу не нырял", courses: "Хочу сертификат", cert: "Уже дайвер" };
  table("paths", ["Вариант", "Нажатий"], Object.entries(d.paths || {}).map(([k, v]) => el("tr", {}, el("td", {}, names[k] || k), el("td", {}, v))));
}
function drawChart(rows) {
  const W = 760, H = 180, P = 28, n = Math.max(rows.length, 1), max = Math.max(1, ...rows.map(r => r.visitors));
  const bw = (W - P * 2) / n, ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg"); svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("role", "img"); svg.setAttribute("aria-label", "Посетители и клики по дням");
  const add = (tag, a, text) => { const e = document.createElementNS(ns, tag); for (const k in a) e.setAttribute(k, a[k]); if (text) e.textContent = text; svg.append(e); };
  rows.forEach((r, i) => {
    const x = P + i * bw, h1 = (H - 50) * r.visitors / max, h2 = (H - 50) * r.contacts / max;
    add("rect", { x: x + 2, y: H - 22 - h1, width: Math.max(bw - 4, 1), height: h1, rx: 2, fill: "var(--line)" });
    add("rect", { x: x + 2, y: H - 22 - h2, width: Math.max(bw - 4, 1), height: h2, rx: 2, fill: "var(--accent)" });
    if (rows.length <= 14 || i % Math.ceil(rows.length / 10) === 0) add("text", { x: x + bw / 2, y: H - 6, "text-anchor": "middle" }, r.day.slice(5));
  });
  add("text", { x: P, y: 12 }, "макс. " + max + " посетителей/день · серый — посетители, красный — написали");
  $("chart").replaceChildren(svg);
}

/* leads */
let leads = [], progNames = {};
$("lf").addEventListener("change", () => loadLeads().catch(fail));
async function loadLeads() {
  let q = sb.from("leads").select("*").order("created_at", { ascending: false }).limit(300);
  if ($("lf").value) q = q.eq("status", $("lf").value);
  const { data, error } = await q; if (error) throw error;
  leads = data;
  const { data: ps } = await sb.from("programs").select("id,name_ru"); progNames = Object.fromEntries((ps || []).map(p => [p.id, p.name_ru]));
  table("leads", ["Когда", "Имя", "Контакт", "Программа", "Чел.", "Даты", "Статус", "Депозит"], data.map(l =>
    el("tr", { data: { id: l.id } }, el("td", {}, fmt(l.created_at)), el("td", {}, l.name), el("td", { class: "mono" }, l.contact),
      el("td", {}, progNames[l.program_id] || l.program_id || ""), el("td", {}, l.people),
      el("td", {}, [day(l.date_from), day(l.date_to)].filter(Boolean).join(" – ")),
      el("td", {}, el("span", { class: "pill " + l.status }, l.status)),
      el("td", {}, l.deposit_usd ? `$${l.deposit_usd} · ${l.deposit_status}` : ""))));
}
let editingLead = null;
$("leads").addEventListener("click", e => {
  const tr = e.target.closest("tr[data-id]"); if (!tr) return;
  const l = leads.find(x => x.id === tr.dataset.id); editingLead = l.id;
  $("le-title").textContent = `${l.name} — ${progNames[l.program_id] || l.program_id || ""}`;
  $("le-info").textContent = [`Контакт: ${l.contact}`, `Людей: ${l.people}`, l.hotel && `Отель: ${l.hotel}`,
    (l.date_from || l.date_to) && `Даты: ${[day(l.date_from), day(l.date_to)].filter(Boolean).join(" – ")}`,
    l.wants_media && "Хочет фото/видео", l.note && `Сообщение: ${l.note}`, `Язык: ${l.lang}`].filter(Boolean).join("\n");
  $("le-status").value = l.status; $("le-dep").value = l.deposit_usd ?? ""; $("le-dstat").value = l.deposit_status;
  $("le-link").value = l.payment_link ?? ""; $("le-note").value = l.admin_note ?? ""; $("le-msg").textContent = "";
  $("lead-edit").hidden = false; $("lead-edit").scrollIntoView({ behavior: "smooth" });
});
$("le-close").addEventListener("click", () => $("lead-edit").hidden = true);
$("lead-edit").addEventListener("submit", async e => {
  e.preventDefault();
  const link = $("le-link").value.trim();
  if (link && !/^https:\/\//.test(link)) { $("le-msg").textContent = "Ссылка должна начинаться с https://"; return; }
  const { error } = await sb.from("leads").update({
    status: $("le-status").value, deposit_usd: $("le-dep").value === "" ? null : Number($("le-dep").value),
    deposit_status: $("le-dstat").value, payment_link: link || null, admin_note: $("le-note").value || null,
  }).eq("id", editingLead);
  if (error) return fail(error);
  $("le-msg").textContent = "Сохранено"; loadLeads().catch(fail);
});

/* content */
let progs = [];
const GRP = { first: "Первый раз", courses: "Курсы", cert: "С сертификатом", snork: "Не ныряют", extra: "Доп." };
async function loadProgs() {
  const { data, error } = await sb.from("programs").select("*").order("grp").order("sort"); if (error) throw error;
  progs = data;
  table("progs", ["Группа", "Название", "Цена", "Советую", "На сайте"], data.map(p =>
    el("tr", { data: { id: p.id } }, el("td", {}, GRP[p.grp] || p.grp), el("td", {}, p.name_ru),
      el("td", { class: "mono" }, (p.price_from ? "от " : "") + "$" + p.price_usd), el("td", {}, p.recommended ? "да" : ""), el("td", {}, p.active ? "да" : "скрыта"))));
}
function editProg(p) {
  const n = !p; p = p || { id: "", grp: "first", sort: 100, price_usd: 0, price_from: false, recommended: false, active: true, name_ru: "", name_en: "", desc_ru: "", desc_en: "" };
  $("pe-title").textContent = n ? "Новая программа" : p.name_ru; $("pe-id").value = p.id; $("pe-id").readOnly = !n;
  $("pe-grp").value = p.grp; $("pe-sort").value = p.sort; $("pe-price").value = p.price_usd; $("pe-from").checked = p.price_from;
  $("pe-rec").checked = p.recommended; $("pe-active").checked = p.active; $("pe-nru").value = p.name_ru; $("pe-nen").value = p.name_en;
  $("pe-dru").value = p.desc_ru; $("pe-den").value = p.desc_en; $("pe-msg").textContent = "";
  $("p-edit").hidden = false; $("p-edit").scrollIntoView({ behavior: "smooth" });
}
$("progs").addEventListener("click", e => { const tr = e.target.closest("tr[data-id]"); if (tr) editProg(progs.find(p => p.id === tr.dataset.id)); });
$("p-new").addEventListener("click", () => editProg(null));
$("pe-close").addEventListener("click", () => $("p-edit").hidden = true);
$("p-edit").addEventListener("submit", async e => {
  e.preventDefault();
  const row = { id: $("pe-id").value.trim(), grp: $("pe-grp").value, sort: Number($("pe-sort").value) || 100, price_usd: Number($("pe-price").value),
    price_from: $("pe-from").checked, recommended: $("pe-rec").checked, active: $("pe-active").checked,
    name_ru: $("pe-nru").value.trim(), name_en: $("pe-nen").value.trim(), desc_ru: $("pe-dru").value.trim(), desc_en: $("pe-den").value.trim(), updated_at: new Date().toISOString() };
  const { error } = await sb.from("programs").upsert(row); if (error) return fail(error);
  $("pe-msg").textContent = "Сохранено, на сайте уже новая версия"; loadProgs().catch(fail);
});

/* invites */
$("inv-new").addEventListener("submit", async e => {
  e.preventDefault();
  const { data: token, error } = await sb.rpc("create_invite", { p_role: $("inv-role").value, p_note: $("inv-note").value.trim() || null });
  if (error) return fail(error);
  $("inv-link").textContent = `${location.origin}/join/#t=${token}`; $("inv-out").hidden = false; $("inv-copied").textContent = ""; $("inv-note").value = "";
  loadInvites().catch(fail);
});
$("inv-copy").addEventListener("click", () => navigator.clipboard.writeText($("inv-link").textContent).then(() => $("inv-copied").textContent = "Скопировано").catch(() => $("inv-copied").textContent = "Выдели и скопируй вручную"));
async function loadInvites() {
  const { data, error } = await sb.from("invites").select("id,role,note,created_at,expires_at,used_at,revoked_at").order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  const now = Date.now();
  table("invites", ["Создан", "Роль", "Для кого", "Статус", ""], data.map(i => {
    const st = i.used_at ? "использован" : i.revoked_at ? "отозван" : new Date(i.expires_at) < now ? "истёк" : "активен до " + fmt(i.expires_at);
    const live = st.startsWith("активен");
    return el("tr", {}, el("td", {}, fmt(i.created_at)), el("td", {}, i.role === "guide" ? "гид" : "клиент"), el("td", {}, i.note || ""), el("td", {}, st),
      el("td", {}, live ? el("button", { type: "button", class: "mini ghost", onclick: async () => { const { error } = await sb.rpc("revoke_invite", { p_id: i.id }); if (error) fail(error); loadInvites().catch(fail); } }, "Отозвать") : ""));
  }));
}

/* users */
async function loadUsers() {
  const [{ data: roles, error }, { data: inv }] = await Promise.all([
    sb.from("user_roles").select("user_id,role,created_at").order("created_at"),
    sb.from("invites").select("used_by,note").not("used_by", "is", null)]);
  if (error) throw error;
  const notes = Object.fromEntries((inv || []).map(i => [i.used_by, i.note]));
  const name = { admin: "админ", guide: "гид", client: "клиент" };
  table("users", ["С", "Роль", "Кто (из инвайта)", "ID", ""], roles.map(r => el("tr", {},
    el("td", {}, fmt(r.created_at)), el("td", {}, name[r.role] || r.role), el("td", {}, notes[r.user_id] || ""), el("td", { class: "mono small" }, r.user_id.slice(0, 8)),
    el("td", {}, r.role === "admin" ? "" : el("button", { type: "button", class: "mini ghost", onclick: async ev => {
      const b = ev.currentTarget;
      if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Точно убрать?"; return; }
      const { error } = await sb.rpc("remove_role", { p_user: r.user_id }); if (error) fail(error); loadUsers().catch(fail);
    } }, "Убрать роль")))));
}

/* audit log */
async function loadLog() {
  const { data, error } = await sb.from("audit_log").select("at,actor,action,target,details").order("at", { ascending: false }).limit(200);
  if (error) throw error;
  table("log", ["Когда", "Кто", "Что", "Объект", "Детали"], data.map(r => el("tr", {},
    el("td", {}, fmt(r.at)), el("td", { class: "mono small" }, (r.actor || "система").slice(0, 8)), el("td", {}, r.action),
    el("td", { class: "mono small" }, (r.target || "").slice(0, 12)), el("td", { class: "small pre" }, summarize(r.details)))));
}
function summarize(d) {
  if (d && d.before && d.after) return Object.keys(d.after).filter(k => k !== "updated_at" && JSON.stringify(d.before[k]) !== JSON.stringify(d.after[k]))
    .map(k => `${k}: ${JSON.stringify(d.before[k])} → ${JSON.stringify(d.after[k])}`).join("\n");
  return JSON.stringify(d).slice(0, 200);
}

route().catch(fail);
