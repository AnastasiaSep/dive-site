"use strict";
const C = window.SITE_CONFIG || {};
const $ = id => document.getElementById(id);
const show = id => ["step1", "sent", "step2", "done", "bad"].forEach(x => $(x).hidden = x !== id);
if (!C.SUPABASE_URL) { document.querySelector("main").innerHTML = '<p class="card narrow">Регистрация заработает после подключения бесплатной базы Supabase (README, шаги 2–6). Сам сайт работает и без неё.</p>'; throw new Error("not configured"); }
const sb = supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { storage: window.sessionStorage, detectSessionInUrl: true } });

const hash = new URLSearchParams(location.hash.slice(1));
const token = hash.get("t");
// remove the token from the address bar and history right away
if (token) history.replaceState(null, "", location.pathname);

(async () => {
  // came back from the e-mail link → Supabase put a session in the URL
  if (hash.get("type") === "invite" || hash.get("access_token")) {
    const { data: { session } } = await sb.auth.getSession();
    history.replaceState(null, "", location.pathname);
    return session ? show("step2") : show("bad");
  }
  if (!token || !/^[A-Za-z0-9_-]{20,64}$/.test(token)) return show("bad");
  show("step1");
  let captcha = "";
  const s = document.createElement("script");
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; s.async = true;
  s.onload = () => turnstile.render("#captcha", { sitekey: C.TURNSTILE_SITEKEY, callback: t => captcha = t, "expired-callback": () => captcha = "" });
  document.head.append(s);

  $("step1").addEventListener("submit", async e => {
    e.preventDefault(); $("err1").textContent = "";
    if (!captcha) { $("err1").textContent = "Подтверди, что ты не робот."; return; }
    $("go").disabled = true;
    try {
      const r = await fetch(C.SUPABASE_URL + "/functions/v1/redeem-invite", {
        method: "POST",
        headers: { "content-type": "application/json", apikey: C.SUPABASE_ANON_KEY, authorization: "Bearer " + C.SUPABASE_ANON_KEY },
        body: JSON.stringify({ token, email: $("email").value.trim(), captcha }),
      });
      if (r.ok) return show("sent");
      const j = await r.json().catch(() => ({}));
      $("err1").textContent = j.error === "invite_invalid" ? "Приглашение уже использовано, отозвано или истекло."
        : r.status === 429 ? "Слишком много попыток. Попробуй через час." : "Не получилось. Попробуй ещё раз.";
    } catch { $("err1").textContent = "Нет связи."; }
    $("go").disabled = false; captcha = ""; try { turnstile.reset(); } catch {}
  });
})();

$("step2").addEventListener("submit", async e => {
  e.preventDefault();
  if ($("pass").value !== $("pass2").value) { $("err2").textContent = "Пароли не совпадают."; return; }
  const { error } = await sb.auth.updateUser({ password: $("pass").value });
  if (error) { $("err2").textContent = error.message; return; }
  await sb.auth.signOut(); show("done");
});
