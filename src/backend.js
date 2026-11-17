/* ===== Backend (optional): live prices, booking requests, anonymous analytics ===== */
(function(){
  const C = window.SITE_CONFIG || {};
  if(!C.SUPABASE_URL || !C.SUPABASE_ANON_KEY) return;
  const FN = C.SUPABASE_URL + "/functions/v1/";
  const H = { "content-type":"application/json", apikey:C.SUPABASE_ANON_KEY, authorization:"Bearer "+C.SUPABASE_ANON_KEY };
  let sid = "";
  try{ sid = sessionStorage.getItem("sid") || ""; }catch(e){}
  if(!/^[a-zA-Z0-9]{16}$/.test(sid)){
    sid = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
    try{ sessionStorage.setItem("sid", sid); }catch(e){}
  }
  const device = matchMedia("(max-width:860px)").matches ? "mobile" : "desktop";
  function track(event, value){
    try{ fetch(FN+"track", {method:"POST", headers:H, keepalive:true,
      body:JSON.stringify({session:sid, event, value:value ? String(value).slice(0,40) : null, lang, device})}).catch(()=>{}); }catch(e){}
  }
  track("view");
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-path],[data-tab],[data-term],[data-pick],#go-wa,#hero-wa,#m-wa,#c-wa-a,#go-tg,#c-tg-a,#copy,[data-set]");
    if(!t) return;
    if(t.dataset.path) track("path", t.dataset.path);
    else if(t.dataset.tab) track("tab", t.dataset.tab);
    else if(t.dataset.term) track("term", t.dataset.term);
    else if(t.dataset.pick) track("pick", t.dataset.pick);
    else if(t.dataset.set) track("lang", t.dataset.set);
    else if(/wa/.test(t.id)) track("wa", t.id);
    else if(/tg/.test(t.id)) track("tg", t.id);
    else if(t.id==="copy") track("copy");
  });

  // live prices: the admin edits them in /admin; the built-in list stays as a fallback
  fetch(C.SUPABASE_URL + "/rest/v1/programs?select=id,grp,sort,price_usd,price_from,recommended,name_ru,name_en,desc_ru,desc_en&order=sort", {headers:H})
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(rows => {
      if(!Array.isArray(rows) || !rows.length) return;
      const byId = Object.fromEntries(rows.map(r => [r.id, r]));
      GROUPS.forEach(g => {
        g.items = g.items.filter(i => byId[i.id]);           // hidden in admin → hidden on site
        g.items.forEach(i => { const r = byId[i.id];
          i.price = r.price_usd; i.from = r.price_from; i.rec = r.recommended;
          i.ru = r.name_ru; i.en = r.name_en; i.d_ru = r.desc_ru || i.d_ru; i.d_en = r.desc_en || i.d_en; });
        rows.filter(r => r.grp===g.id && !ALL.some(a => a.id===r.id)).forEach(r => g.items.push({
          id:r.id, price:r.price_usd, from:r.price_from, rec:r.recommended, ru:r.name_ru, en:r.name_en,
          meta_ru:[], meta_en:[], d_ru:r.desc_ru, d_en:r.desc_en }));
      });
      ALL.length = 0; GROUPS.forEach(g => g.items.forEach(i => ALL.push({...i, group:g})));
      applyLang();
    }).catch(()=>{});

  // booking request stored on the server (needs captcha)
  if(!C.TURNSTILE_SITEKEY) return;
  $("lead-box").hidden = false;
  let captcha = "", widget = null;
  const s = document.createElement("script");
  s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; s.async = true;
  s.onload = () => { widget = turnstile.render("#captcha", { sitekey:C.TURNSTILE_SITEKEY, callback:t => captcha = t, "expired-callback":() => captcha = "" }); };
  document.head.appendChild(s);
  const say = (ru, en) => $("lead-status").textContent = lang==="ru" ? ru : en;
  $("send-lead").addEventListener("click", async () => {
    const name = $("f-name").value.trim(), contact = $("f-contact").value.trim();
    if(!name || contact.length < 3) return say("Укажи имя и куда ответить.", "Add your name and where to reply.");
    if(!captcha) return say("Подтверди, что ты не робот.", "Please complete the check above.");
    $("send-lead").disabled = true; say("Отправляю…", "Sending…");
    try{
      const r = await fetch(FN+"submit-lead", {method:"POST", headers:H, body:JSON.stringify({
        captcha, name, contact, program_id:$("f-prog").value, people:Number($("f-people").value)||1,
        date_from:$("f-from").value||null, date_to:$("f-to").value||null, hotel:$("f-hotel").value,
        wants_media:$("f-photo").checked, note:$("f-note").value, lang })});
      if(r.ok) say("Заявка у меня, скоро отвечу по твоему контакту.", "Got it, I'll reply to the contact you left soon.");
      else if(r.status===429) say("Слишком много заявок с этого адреса. Напиши в WhatsApp.", "Too many requests. Please use WhatsApp.");
      else say("Не получилось отправить. Напиши в WhatsApp.", "Couldn't send. Please use WhatsApp.");
    }catch(e){ say("Нет связи. Напиши в WhatsApp.", "No connection. Please use WhatsApp."); }
    $("send-lead").disabled = false; captcha = "";
    try{ turnstile.reset(widget); }catch(e){}
  });
})();
