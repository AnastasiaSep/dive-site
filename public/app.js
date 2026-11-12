/* ===== EDIT HERE: contacts ===== */
const CONTACT = { telegram:"poopsickk", whatsapp:"84559110497", instagram:"nastya.dives" };

/* ===== EDIT HERE: glossary ===== */
const TERMS = {
 dsd:{t:"Discover Scuba",ru:"Пробное погружение для тех, кто ни разу не нырял. Инструктор всё время рядом, сертификат не нужен.",en:"A try dive for people who have never dived. The instructor stays with you; no certificate needed."},
 fun:{t:"Fun dives",ru:"Погружения для тех, у кого уже есть сертификат. Без обучения, просто ныряем с гидом и смотрим риф.",en:"Dives for certified divers. No training, just exploring the reef with a guide."},
 ow:{t:"Open Water",ru:"Первый курс PADI. После него можно нырять до 18 м с напарником в любой стране.",en:"The first PADI course. Afterwards you can dive to 18 m with a buddy anywhere in the world."},
 aow:{t:"Advanced",ru:"Следующий курс после Open Water: глубина до 30 м, навигация, плавучесть.",en:"The course after Open Water: depth to 30 m, navigation and buoyancy."},
 nitrox:{t:"Nitrox",ru:"Воздух с повышенным содержанием кислорода. Позволяет дольше оставаться на глубине.",en:"Air with extra oxygen. It lets you stay longer at depth."},
 refresh:{t:"Refresher",ru:"Короткое повторение навыков, если давно не нырял(а).",en:"A short skills review if you haven't dived in a while."},
 elearn:{t:"eLearning",ru:"Онлайн-теория PADI: проходишь на телефоне до приезда.",en:"PADI online theory you do on your phone before you arrive."},
 rescue:{t:"Rescue Diver",ru:"Курс, где учишься помогать себе и напарнику в сложных ситуациях.",en:"The course where you learn to handle problems and help your buddy."},
 bubble:{t:"Bubblemaker",ru:"Первое знакомство с аквалангом для детей 8–9 лет, на глубине до 2 м.",en:"A first taste of scuba for kids aged 8–9, to 2 m."}
};

/* ===== EDIT HERE: prices (USD) ===== */
const GROUPS = [
 {id:"first", ru:"Первый раз", en:"First time", items:[
  {id:"dsd95", rec:true, term:"dsd", price:95, ru:"Пробное погружение", en:"Discover Scuba", meta_ru:["2 погружения с лодки","до 12 м"], meta_en:["2 boat dives","to 12 m"],
   d_ru:"Онлайн-теория, инструктаж и два погружения с инструктором. Сертификат не нужен.", d_en:"Online theory, a briefing and two boat dives with an instructor. No certificate needed."},
  {id:"dsd135", term:"dsd", price:135, ru:"Пробное + бассейн", en:"Discover Scuba + pool", meta_ru:["бассейн","2 погружения"], meta_en:["pool session","2 boat dives"],
   d_ru:"То же, но сначала занятие в бассейне. Лучший вариант, если волнуешься.", d_en:"Same, with a pool session first. Best if you're nervous."},
  {id:"dsd65", price:65, ru:"1 погружение + снорклинг", en:"1 try dive + snorkelling", meta_ru:["1 погружение"], meta_en:["1 dive"],
   d_ru:"Попробовать один раз и поплавать с маской.", d_en:"One try dive plus snorkelling."},
  {id:"bubble", term:"bubble", price:60, ru:"Bubblemaker, дети 8–9", en:"Bubblemaker, kids 8–9", meta_ru:["до 2 м"], meta_en:["to 2 m"],
   d_ru:"Первое знакомство с аквалангом для детей.", d_en:"A first taste of scuba for kids."}
 ]},
 {id:"courses", ru:"Курсы PADI", en:"PADI courses", items:[
  {id:"ow", rec:true, term:"ow", price:450, ru:"Open Water", en:"Open Water", meta_ru:["полдня бассейн","2 дня в море","4 погружения"], meta_en:["half-day pool","2 days at sea","4 dives"],
   d_ru:"Первый сертификат дайвера, до 18 м. $150 онлайн-теория PADI + $300 бассейн и море. Страховка DAN в подарок.", d_en:"Your first dive licence, to 18 m. $150 PADI eLearning + $300 pool and ocean training. Free DAN insurance."},
  {id:"aow", term:"aow", price:495, ru:"Advanced + Nitrox", en:"Advanced + Nitrox", meta_ru:["2 дня","5 погружений","до 30 м"], meta_en:["2 days","5 dives","to 30 m"],
   d_ru:"Следующий уровень плюс специализация на найтроксе.", d_en:"The next level plus the Nitrox specialty."},
  {id:"owaow", price:795, ru:"Open Water + Advanced + Nitrox", en:"Open Water + Advanced + Nitrox", meta_ru:["5 дней","9 погружений"], meta_en:["5 days","9 dives"],
   d_ru:"С нуля до Advanced за одну поездку. На $150 дешевле, чем по отдельности.", d_en:"From zero to Advanced in one trip, $150 less than booking separately."},
  {id:"rescue", term:"rescue", price:350, ru:"Rescue Diver", en:"Rescue Diver", meta_ru:["полдня бассейн","2 дня в море"], meta_en:["half-day pool","2 days at sea"],
   d_ru:"EFR (первая помощь) $150. Добавить Nitrox $175, Deco Chamber $150.", d_en:"EFR first aid $150. Add Nitrox $175, Deco Chamber $150."},
  {id:"pack", price:1000, ru:"Пакет: Advanced + Nitrox + Rescue + EFR + Deco Chamber", en:"Bundle: Advanced + Nitrox + Rescue + EFR + Deco Chamber", meta_ru:["всё вместе"], meta_en:["all in one"],
   d_ru:"Самый выгодный путь к Rescue.", d_en:"The best-value route to Rescue."},
  {id:"spec", price:125, from:true, ru:"Специализации", en:"Specialties", meta_ru:["с онлайн-теорией"], meta_en:["with eLearning"],
   d_ru:"Deep, Nitrox, Night, навигация, плавучесть и другие. Полный список ниже.", d_en:"Deep, Nitrox, Night, Navigation, Buoyancy and more. Full list below."}
 ]},
 {id:"cert", ru:"С сертификатом", en:"Certified", items:[
  {id:"fun2", rec:true, term:"fun", price:80, ru:"Fun dives: 2 погружения", en:"Fun dives: 2 dives", meta_ru:["с гидом","7:30–14:00"], meta_en:["guided","7:30am–2pm"],
   d_ru:"1 погружение $55, 3 погружения $100 (по расписанию).", d_en:"1 dive $55, 3 dives $100 (subject to schedule)."},
  {id:"night", price:75, ru:"Ночное погружение", en:"Night dive", meta_ru:["лодка, от 2 дайверов"], meta_en:["boat, 2+ divers"],
   d_ru:"С пляжа $50.", d_en:"From the beach $50."},
  {id:"refresh", term:"refresh", price:50, ru:"Рефрешер", en:"Refresher", meta_ru:["бассейн / пляж / лодка"], meta_en:["pool / beach / boat"],
   d_ru:"Если давно не нырял(а). Проходит в рамках первого погружения, онлайн-теория +$50.", d_en:"If you haven't dived in a while. Done as part of your first dive; online theory +$50."},
  {id:"speed", price:75, unit:{ru:"/ чел. в день",en:"/ person / day"}, ru:"Частный катер", en:"Private speedboat", meta_ru:["2–4 человека","Electric Nose"], meta_en:["2–4 people","Electric Nose"],
   d_ru:"Гибкий график и дальние сайты: The Wall 42 м, Ray Plateau 30 м, The Freefall 40 м. Для курсов и fun dives.", d_en:"Flexible schedule and remote sites: The Wall 42 m, Ray Plateau 30 m, The Freefall 40 m. For courses and fun dives."}
 ]},
 {id:"snork", ru:"Не ныряют", en:"Non-divers", items:[
  {id:"snork40", price:40, ru:"Снорклинг / пассажир", en:"Snorkelling / passenger", meta_ru:["маска и трубка","обед"], meta_en:["mask & snorkel","lunch"],
   d_ru:"День на лодке для друзей и семьи. Дети до 5 лет бесплатно.", d_en:"A day on the boat for friends and family. Under-5s free."},
  {id:"snork50", price:50, ru:"Снорклинг PADI с гидом", en:"PADI snorkelling with guide", meta_ru:["с гидом"], meta_en:["guided"],
   d_ru:"Можно добавить пробное погружение всего за $30.", d_en:"Add a try dive for just $30."}
 ]}
];
const SPECIALTIES = [
 ["Dive Against Debris","2",125],["Nitrox","2",250],["Peak Performance Buoyancy","2",200],["Equipment","0",175],
 ["Deep","3–4",250],["Deep + Nitrox","3–4",450],["Navigation","3",200],["Search & Recovery","3",250],["Night","3",250],
 ["Vietnam Diver","3",225],["Vietnam Nudibranch","2",200],["Self-Reliant (Solo)","3",250],["VN Deco Chamber","—",150]
];
/* ===== EDIT HERE: season (Jan…Dec): good / ok / rough ===== */
const SEASON = ["rough","ok","good","good","good","good","ok","ok","ok","rough","rough","rough"];
/* ================================ */

const SEASON_WORD = {ru:{good:"лучше",ok:"хорошо",rough:"дожди"}, en:{good:"best",ok:"good",rough:"rain"}};
const MONTHS = {ru:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],
                en:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]};
const ALL = GROUPS.flatMap(g => g.items.map(i => ({...i, group:g})));
let lang = "en", tab = "first";
try{ const s = localStorage.getItem("lang"); if(s==="ru"||s==="en") lang = s; else if((navigator.language||"").toLowerCase().startsWith("ru")) lang = "ru"; }catch(e){ if((navigator.language||"").toLowerCase().startsWith("ru")) lang = "ru"; }

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = i => `${i.from ? (lang==="ru"?"от ":"from ") : ""}$${i.price.toLocaleString("en-US")}`;

function renderTabs(){
  $("tabs").innerHTML = GROUPS.map(g => `<button type="button" role="tab" id="tab-${g.id}" aria-controls="plist" aria-selected="${g.id===tab}" tabindex="${g.id===tab?0:-1}" data-tab="${g.id}">${esc(g[lang])}</button>`).join("");
  $("plist").setAttribute("aria-labelledby","tab-"+tab);
}
function title(i){
  const t = esc(i[lang]);
  return i.term ? `<button type="button" class="term" data-term="${i.term}">${t}</button>` : t;
}
function renderList(){
  const g = GROUPS.find(x=>x.id===tab);
  $("plist").innerHTML = g.items.map(i => `
    <article class="item">
      <div class="name"><h3>${title(i)}</h3>${i.rec?`<span class="rec">${lang==="ru"?"советую":"start here"}</span>`:""}</div>
      ${i["meta_"+lang].length?`<div class="meta">${i["meta_"+lang].map(esc).join("  ·  ")}</div>`:""}
      <p>${esc(i["d_"+lang]||"")}</p>
      <div class="right"><span class="price">${money(i)}${i.unit?`<small>${esc(i.unit[lang])}</small>`:""}</span>
        <button type="button" class="btn sm" data-pick="${esc(i.id)}">${lang==="ru"?"Записаться":"Book"}</button></div>
    </article>`).join("");
  $("spec-box").hidden = tab !== "courses";
  $("spec-table").innerHTML = SPECIALTIES.map(([n,d,p]) => `<tr><td>${esc(n)} <span class="muted">${d==="—"?"":"· "+d+(lang==="ru"?" погр.":" dives")}</span></td><td>$${p}</td></tr>`).join("");
}
function renderGauge(){
  // side view: surface at the top, depth grows downward, like a dive profile
  const y0=22, y1=170, max=30, sy=d=>y0+(y1-y0)*d/max, L=58;
  let s=`<rect x="${L}" y="0" width="${760-L}" height="${y0}" fill="var(--bg2)"/>`;
  for(let d=0; d<=30; d+=6) s+=`<line x1="${L}" y1="${sy(d)}" x2="760" y2="${sy(d)}" stroke="var(--line)" ${d?'stroke-dasharray="2 6"':''}/><text x="${L-10}" y="${sy(d)+4}" text-anchor="end" style="font:400 11px var(--f-data);fill:var(--dim)">${d} m</text>`;
  const rows=[[lang==="ru"?"Пробное":"Try dive",12],["Open Water",18],["Advanced",30]];
  rows.forEach(([n,d],k)=>{const x=L+120+k*210;
    s+=`<line x1="${x}" y1="${y0}" x2="${x}" y2="${sy(d)}" stroke="var(--accent)" stroke-width="2"/>
        <circle cx="${x}" cy="${sy(d)}" r="5" fill="var(--accent)"/>
        <text x="${x+12}" y="${sy(d)-6}" style="font:600 14px var(--f-body);fill:var(--fg)">${esc(n)}</text>
        <text x="${x+12}" y="${sy(d)+12}" style="font:500 12px var(--f-data);fill:var(--accent)">${lang==="ru"?"до":"to"} ${d} m</text>`;});
  $("gauge").innerHTML = s;
}
function renderSeason(){
  $("season").innerHTML = SEASON.map((s,i)=>`<div class="m ${s}"><i></i><span>${MONTHS[lang][i]}</span><small>${SEASON_WORD[lang][s]}</small></div>`).join("");
}
function renderSelect(){
  const keep = $("f-prog").value;
  $("f-prog").innerHTML = GROUPS.map(g => `<optgroup label="${esc(g[lang])}">${g.items.map(i=>`<option value="${i.id}">${esc(i[lang])} — ${money(i)}</option>`).join("")}</optgroup>`).join("");
  if(keep) $("f-prog").value = keep;
}
function fmtDate(v){
  if(!v) return "";
  const [y,m,d] = v.split("-").map(Number);
  return `${d} ${MONTHS[lang][m-1]}`;
}
function dates(){
  const a=$("f-from").value, b=$("f-to").value;
  if(a && b && b!==a) return `${fmtDate(a)} – ${fmtDate(b)}`;
  return fmtDate(a||b);
}
function message(){
  const p = ALL.find(x=>x.id===$("f-prog").value) || ALL[0];
  const L = lang==="ru"
    ? ["Привет, Настя! Хочу записаться.","Имя","Программа","Человек","Даты","Отель","Фото/видео","Вопросы"]
    : ["Hi Nastya! I'd like to book a dive.","Name","Program","People","Dates","Hotel","Photos/video","Notes"];
  const v = [$("f-name").value, `${p[lang]} (${money(p)})`, $("f-people").value, dates(), $("f-hotel").value,
             $("f-photo").checked ? (lang==="ru"?"да, хочу":"yes please") : "", $("f-note").value];
  return [L[0], ...v.map((x,i)=> x && String(x).trim() ? `${L[i+1]}: ${String(x).trim()}` : null)].filter(Boolean).join("\n");
}
function waLink(text){ return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`; }
function updateMsg(){
  const m = message();
  $("msg").textContent = m;
  $("go-wa").href = waLink(m);
  const hi = lang==="ru" ? "Привет, Настя! Хочу нырнуть в Нячанге." : "Hi Nastya! I'd like to dive in Nha Trang.";
  $("hero-wa").href = waLink(hi); $("m-wa").href = waLink(hi);
}
function applyLang(){
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang;
  $("lang-ru").setAttribute("aria-pressed", lang==="ru");
  $("lang-en").setAttribute("aria-pressed", lang==="en");
  renderTabs(); renderList(); renderGauge(); renderSeason(); renderSelect(); updateMsg(); hideTip();
}
function setTab(id, focus){
  tab=id; renderTabs(); renderList();
  if(focus) $("tab-"+id).focus();
}
const smooth = () => matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/* glossary popover */
function showTip(k){
  const t = TERMS[k]; if(!t) return;
  $("tip-t").textContent = t.t; $("tip-p").textContent = t[lang];
  $("tip").hidden = false; $("tip-x").focus();
}
function hideTip(){ $("tip").hidden = true; }
document.addEventListener("click", e => {
  const b = e.target.closest("[data-term]");
  if(b){ showTip(b.dataset.term); return; }
  if(!$("tip").hidden && !e.target.closest("#tip")) hideTip();
});
$("tip-x").addEventListener("click", hideTip);
document.addEventListener("keydown", e => { if(e.key==="Escape") hideTip(); });

document.querySelectorAll("[data-set]").forEach(b => b.addEventListener("click", () => {
  lang = b.dataset.set; try{ localStorage.setItem("lang", lang); }catch(e){}
  applyLang();
}));
document.querySelectorAll("[data-path]").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("[data-path]").forEach(x => x.setAttribute("aria-pressed", x===b));
  setTab(b.dataset.path);
  $("prices").scrollIntoView({behavior: smooth()});
}));
$("tabs").addEventListener("click", e => { const b=e.target.closest("[data-tab]"); if(b) setTab(b.dataset.tab); });
$("tabs").addEventListener("keydown", e => {
  if(e.key!=="ArrowRight" && e.key!=="ArrowLeft") return;
  const i = GROUPS.findIndex(g=>g.id===tab);
  const n = (i + (e.key==="ArrowRight"?1:-1) + GROUPS.length) % GROUPS.length;
  e.preventDefault(); setTab(GROUPS[n].id, true);
});
$("plist").addEventListener("click", e => {
  const b = e.target.closest("[data-pick]"); if(!b) return;
  $("f-prog").value = b.dataset.pick; updateMsg();
  $("book").scrollIntoView({behavior: smooth()});
});
$("f").addEventListener("input", updateMsg);
$("f").addEventListener("change", updateMsg);
$("f").addEventListener("submit", e => e.preventDefault());
$("copy").addEventListener("click", () => {
  const m = message();
  const done = () => $("toast").textContent = lang==="ru" ? "Скопировано. Вставь в чат Telegram." : "Copied. Paste it into Telegram.";
  try{ navigator.clipboard.writeText(m).then(done).catch(selectMsg); }catch(e){ selectMsg(); }
});
function selectMsg(){
  const r=document.createRange(); r.selectNodeContents($("msg"));
  const s=getSelection(); s.removeAllRanges(); s.addRange(r);
  $("toast").textContent = lang==="ru" ? "Текст выделен: скопируй его вручную." : "Text selected: copy it manually.";
}
const today = new Date(); const iso = new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
$("f-from").min = iso; $("f-to").min = iso;
$("f-from").addEventListener("change", () => { $("f-to").min = $("f-from").value || iso; });

$("go-tg").href = $("c-tg-a").href = `https://t.me/${CONTACT.telegram}`;
$("c-wa-a").href = `https://wa.me/${CONTACT.whatsapp}`;
$("c-ig-a").href = `https://instagram.com/${CONTACT.instagram}`;
$("c-tg").textContent = "@" + CONTACT.telegram;
$("c-wa").textContent = "+" + CONTACT.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/,"$1 $2 $3 $4");
$("c-ig").textContent = "@" + CONTACT.instagram;
applyLang();


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
      if(r.ok) say("Заявка у меня. Отвечу туда, куда ты указал(а).", "Got it. I'll reply where you told me.");
      else if(r.status===429) say("Слишком много заявок с этого адреса. Напиши в WhatsApp.", "Too many requests. Please use WhatsApp.");
      else say("Не получилось отправить. Напиши в WhatsApp.", "Couldn't send. Please use WhatsApp.");
    }catch(e){ say("Нет связи. Напиши в WhatsApp.", "No connection. Please use WhatsApp."); }
    $("send-lead").disabled = false; captcha = "";
    try{ turnstile.reset(widget); }catch(e){}
  });
})();
