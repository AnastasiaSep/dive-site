/* ===== EDIT HERE: contacts ===== */
const CONTACT = { telegram:"poopsickk", whatsapp:"84559110497", instagram:"nastya.dives" };

/* ===== EDIT HERE: glossary ===== */
const TERMS = {
 dsd:{t:"Discover Scuba",ru:"Пробное погружение для тех, кто ни разу не нырял. Инструктор всё время рядом, сертификат не нужен.",en:"A try dive for people who have never dived. The instructor stays with you; no certificate needed."},
 fun:{t:"Fun dives",ru:"Погружения для тех, у кого уже есть сертификат. Без обучения, просто ныряем с гидом и смотрим риф.",en:"Dives for certified divers. No training, just exploring the reef with a guide."},
 ow:{t:"Open Water",ru:"Первый курс PADI. После него можно нырять до 18 м с напарником в любой стране.",en:"The first PADI course. Afterwards you can dive to 18 m with a buddy anywhere in the world."},
 aow:{t:"Advanced",ru:"Следующий курс после Open Water: глубина до 30 м, навигация, плавучесть.",en:"The course after Open Water: depth to 30 m, navigation and buoyancy."},
 nitrox:{t:"Nitrox",ru:"Воздух с повышенным содержанием кислорода. Позволяет дольше оставаться на глубине.",en:"Air with extra oxygen. It lets you stay longer at depth."},
 refresh:{t:"Refresher",ru:"Короткое повторение навыков, если последнее погружение было давно.",en:"A short skills review if you haven't dived in a while."},
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
   d_ru:"Если последнее погружение было давно. Проходит в рамках первого погружения, онлайн-теория +$50.", d_en:"If you haven't dived in a while. Done as part of your first dive; online theory +$50."},
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
/* ================================ */

const MONTHS = {ru:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],
                en:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]};

/* ===== EDIT HERE: the 2-question match ===== */
const QUIZ = {
 q1:{ru:"Был опыт с аквалангом?", en:"Have you dived with scuba before?", opts:[
  {path:"first", ru:"Пока нет", en:"Not yet", s_ru:"Попробуем вместе, сертификат не нужен", s_en:"We'll try it together, no certificate needed"},
  {path:"courses", ru:"Хочу научиться", en:"I want to learn", s_ru:"Курс PADI и сертификат на всю жизнь", s_en:"A PADI course and a licence for life"},
  {path:"cert", ru:"Да, есть сертификат", en:"Yes, I'm certified", s_ru:"Покажу лучшие сайты у островов", s_en:"I'll show you the best island sites"}]},
 first:{ru:"Как тебе в воде?", en:"How do you feel in the water?", opts:[
  {pick:"dsd95", ru:"Спокойно, плаваю уверенно", en:"Relaxed, I swim well", why_ru:"Раз в воде тебе спокойно, сразу едем в море. Два погружения до 12 м, инструктор всё время рядом и держит тебя в поле зрения.", why_en:"Since you're at ease in the water, we head straight out to sea. Two dives to 12 m with an instructor right beside you the whole time."},
  {pick:"dsd135", ru:"Немного волнуюсь", en:"A bit nervous", why_ru:"Сначала спокойно разберёмся со всем в бассейне, где можно встать на дно. К выходу в море ты уже будешь знать, что делать, и волнение уйдёт.", why_en:"First we sort everything out in a pool where you can stand up. By the time we're at sea you'll know what to do and the nerves fade."},
  {pick:"dsd65", ru:"Хочу попробовать чуть-чуть", en:"Just a taste", why_ru:"Одно погружение с инструктором, а потом плаваешь с маской над рифом. Хороший способ понять, твоё это или нет.", why_en:"One dive with an instructor, then snorkelling over the reef. A good way to find out if diving is for you."},
  {pick:"bubble", ru:"Это для ребёнка 8–9 лет", en:"It's for a child aged 8–9", why_ru:"Bubblemaker: ребёнок дышит из акваланга на глубине до 2 м под присмотром инструктора. Обычно после этого просят ещё.", why_en:"Bubblemaker: your child breathes from a real scuba set no deeper than 2 m, with an instructor watching. Most kids ask to go again."}]},
 courses:{ru:"Сколько дней есть на обучение?", en:"How many days do you have for training?", opts:[
  {pick:"ow", ru:"2–3 дня", en:"2–3 days", why_ru:"Open Water: теорию проходишь онлайн ещё дома, здесь бассейн и два дня в море. Дальше можно нырять с напарником в любой стране.", why_en:"Open Water: theory online before you fly, then a pool session and two days at sea. After that you can dive with a buddy anywhere."},
  {pick:"owaow", ru:"5 дней, хочу сразу больше", en:"5 days, I want more", why_ru:"С нуля до Advanced за одну поездку: 9 погружений и глубина до 30 м. Выходит на $150 дешевле, чем брать курсы по отдельности.", why_en:"From zero to Advanced in one trip: 9 dives and depth to 30 m, $150 less than booking the courses separately."},
  {pick:"aow", ru:"У меня уже есть Open Water", en:"I already have Open Water", why_ru:"Advanced + Nitrox за 2 дня: глубина до 30 м, навигация и дыхание найтроксом, чтобы дольше оставаться на глубине.", why_en:"Advanced + Nitrox in 2 days: depth to 30 m, navigation and nitrox so you can stay down longer."},
  {pick:"rescue", ru:"Хочу Rescue", en:"I want Rescue", why_ru:"Rescue Diver учит замечать проблемы раньше, чем они случились, и помогать напарнику. После него ныряешь заметно спокойнее.", why_en:"Rescue Diver teaches you to spot problems before they happen and help your buddy. You dive a lot calmer afterwards."}]},
 cert:{ru:"Когда был последний дайв?", en:"When was your last dive?", opts:[
  {pick:"fun2", ru:"Меньше полугода назад", en:"Less than 6 months ago", why_ru:"Два погружения с гидом у Хон Мун. Маршруты можно посмотреть на картах ниже и выбрать, куда хочется.", why_en:"Two guided dives around Hon Mun. Check the routes on the maps below and pick where you'd like to go."},
  {pick:"refresh", ru:"Больше года назад", en:"Over a year ago", why_ru:"Начнём с короткого рефрешера прямо в первый день: вспомним навыки без спешки, и дальше ныряем как обычно.", why_en:"We start with a short refresher on day one: we go over the skills without rushing, then dive as usual."},
  {pick:"speed", ru:"Хочу дальние сайты", en:"I want remote sites", why_ru:"Частный катер на 2–4 человека: The Wall 42 м, Ray Plateau 30 м, The Freefall 40 м, и график под вас.", why_en:"A private speedboat for 2–4 people: The Wall 42 m, Ray Plateau 30 m, The Freefall 40 m, on your schedule."},
  {pick:"night", ru:"Хочу ночной дайв", en:"I want a night dive", why_ru:"Ночью риф совсем другой: выходят охотники, а планктон светится от каждого движения руки.", why_en:"The reef is a different place at night: hunters come out and the plankton lights up when you move your hand."}]}
};

const ALL = GROUPS.flatMap(g => g.items.map(i => ({...i, group:g})));
let lang = "en", tab = "first", quiz = {step:"q1", path:null, pick:null};
try{ const s = localStorage.getItem("lang"); if(s==="ru"||s==="en") lang = s; else if((navigator.language||"").toLowerCase().startsWith("ru")) lang = "ru"; }catch(e){ if((navigator.language||"").toLowerCase().startsWith("ru")) lang = "ru"; }
try{ const q = JSON.parse(localStorage.getItem("quiz") || "null"); if(q && QUIZ[q.path] && q.pick) quiz = {step:"done", path:q.path, pick:q.pick}; }catch(e){}

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = i => `${i.from ? (lang==="ru"?"от ":"from ") : ""}$${i.price.toLocaleString("en-US")}`;
const T = (ru, en) => lang === "ru" ? ru : en;

function renderTabs(){
  $("tabs").innerHTML = GROUPS.map(g => {
    const min = Math.min(...g.items.map(i => i.price));
    return `<button type="button" role="tab" id="tab-${g.id}" aria-controls="plist" aria-selected="${g.id===tab}" tabindex="${g.id===tab?0:-1}" data-tab="${g.id}">
      <b>${esc(g[lang])}</b><small>${T("от","from")} $${min} · ${g.items.length} ${T(g.items.length>4?"вариантов":"варианта", "options")}</small></button>`;
  }).join("");
  $("plist").setAttribute("aria-labelledby","tab-"+tab);
}
function title(i){
  const t = esc(i[lang]);
  return i.term ? `<button type="button" class="term" data-term="${i.term}">${t}</button>` : t;
}
function renderList(){
  const g = GROUPS.find(x=>x.id===tab) || GROUPS[0];
  $("plist").innerHTML = g.items.map(i => `
    <article class="item${i.rec?" rec":""}">
      <div class="name"><h3>${title(i)}</h3>${i.rec?`<span class="badge">${T("советую","my pick")}</span>`:""}</div>
      ${(i["meta_"+lang]||[]).length?`<div class="meta">${i["meta_"+lang].map(esc).join("  ·  ")}</div>`:"<div></div>"}
      <p>${esc(i["d_"+lang]||"")}</p>
      <div class="row"><span class="price">${money(i)}${i.unit?`<small>${esc(i.unit[lang])}</small>`:""}</span>
        <button type="button" class="btn sm${i.rec?" primary":""}" data-pick="${esc(i.id)}">${T("Записаться","Book this")}</button></div>
    </article>`).join("");
  $("spec-box").hidden = tab !== "courses";
  $("spec-table").innerHTML = SPECIALTIES.map(([n,d,p]) => `<tr><td>${esc(n)} <span class="muted">${d==="—"?"":"· "+d+T(" погр."," dives")}</span></td><td>$${p}</td></tr>`).join("");
}

/* ===== quiz: questions and the answer live in one card ===== */
function renderQuiz(){
  const body = $("q-body"), done = quiz.step === "done" && quiz.pick;
  if(done){ body.innerHTML = resultHTML(); return; }
  const q = QUIZ[quiz.step];
  body.innerHTML = `<h3 class="q-title">${esc(q[lang])}</h3><div class="q-opts">${q.opts.map((o,k) => {
    if(o.path) return `<button type="button" class="q-opt" data-path="${o.path}"><span class="ic">${k+1}</span><span><b>${esc(o[lang])}</b><small>${esc(o["s_"+lang])}</small></span><i aria-hidden="true">→</i></button>`;
    const it = ALL.find(i => i.id === o.pick);
    return `<button type="button" class="q-opt" data-q="${o.pick}"><span class="ic">${k+1}</span><span><b>${esc(o[lang])}</b>${it?`<small>${esc(it[lang])} · ${money(it)}</small>`:""}</span><i aria-hidden="true">→</i></button>`;
  }).join("")}</div>${quiz.step!=="q1"?`<button type="button" class="q-link" data-qback>← ${T("Назад","Back")}</button>`:""}`;
}
function resultHTML(){
  const it = ALL.find(i => i.id === quiz.pick); if(!it) return "";
  const p = QUIZ.q1.opts.find(o => o.path === quiz.path), opt = (QUIZ[quiz.path]?.opts || []).find(o => o.pick === it.id);
  return `<div class="q-result">
    <p class="q-ans">${T("Твои ответы","Your answers")}: ${p?esc(p[lang]):""}${opt?` · ${esc(opt[lang])}`:""}</p>
    <div class="q-head"><div><h3>${title(it)}</h3></div>
      <div class="q-price">${money(it)}${it.unit?`<small>${esc(it.unit[lang])}</small>`:""}</div></div>
    ${opt?`<p class="q-why">${esc(opt["why_"+lang])}</p>`:""}
    <ul class="q-meta">${(it["meta_"+lang]||[]).map(m=>`<li>${esc(m)}</li>`).join("")}<li>${T("снаряжение и обед включены","gear and lunch included")}</li></ul>
    <div class="q-act">
      <button type="button" class="btn primary" data-pick="${esc(it.id)}">${T("Записаться","Book this dive")}</button>
      <button type="button" class="q-link" data-qredo>↺ ${T("Пройти заново","Start over")}</button>
    </div></div>`;
}
function saveQuiz(){ try{ localStorage.setItem("quiz", JSON.stringify({path:quiz.path, pick:quiz.pick})); }catch(e){} }

/* program picker: a styled listbox in front of the native <select>, which stays the source of truth */
function renderSelect(){
  renderNativeSelect();
  $("prog-list").innerHTML = GROUPS.map(g => `<li role="presentation" class="pk-g">${esc(g[lang])}</li>` + g.items.map(i =>
    `<li role="option" id="pk-${i.id}" data-v="${i.id}" aria-selected="false"><span>${esc(i[lang])}</span><em>${money(i)}</em></li>`).join("")).join("");
  syncProg();
}
function syncProg(){
  const v = $("f-prog").value, it = ALL.find(i => i.id === v);
  $("prog-btn-t").innerHTML = it ? `<span>${esc(it[lang])}</span><em>${money(it)}</em>` : "";
  $("prog-list").querySelectorAll("[data-v]").forEach(li => li.setAttribute("aria-selected", li.dataset.v === v));
}
function progOpen(open){
  const box = $("prog"), list = $("prog-list");
  box.classList.toggle("open", open); $("prog-btn").setAttribute("aria-expanded", open);
  if(open){
    const cur = list.querySelector('[aria-selected="true"]') || list.querySelector("[data-v]");
    progFocus(cur); list.focus({preventScroll:true});
    // open upwards when there is no room below
    const r = $("prog-btn").getBoundingClientRect();
    box.classList.toggle("up", innerHeight - r.bottom < 300 && r.top > innerHeight - r.bottom);
  }
}
function progFocus(li){
  if(!li) return;
  $("prog-list").querySelectorAll(".hl").forEach(x => x.classList.remove("hl"));
  li.classList.add("hl"); $("prog-list").setAttribute("aria-activedescendant", li.id);
  const l = $("prog-list"); if(li.offsetTop < l.scrollTop) l.scrollTop = li.offsetTop - 30; else if(li.offsetTop + li.offsetHeight > l.scrollTop + l.clientHeight) l.scrollTop = li.offsetTop + li.offsetHeight - l.clientHeight + 6;
}
function progPick(v){ $("f-prog").value = v; updateMsg(); progOpen(false); $("prog-btn").focus(); }
$("prog-btn").addEventListener("click", () => progOpen(!$("prog").classList.contains("open")));
$("prog-btn").addEventListener("keydown", e => { if(e.key === "ArrowDown" || e.key === "ArrowUp"){ e.preventDefault(); progOpen(true); } });
$("prog-list").addEventListener("click", e => { const li = e.target.closest("[data-v]"); if(li) progPick(li.dataset.v); });
$("prog-list").addEventListener("pointermove", e => { const li = e.target.closest("[data-v]"); if(li && !li.classList.contains("hl")) progFocus(li); });
$("prog-list").addEventListener("keydown", e => {
  const opts = [...$("prog-list").querySelectorAll("[data-v]")], i = opts.findIndex(o => o.classList.contains("hl"));
  if(e.key === "ArrowDown"){ e.preventDefault(); progFocus(opts[Math.min(opts.length - 1, i + 1)]); }
  else if(e.key === "ArrowUp"){ e.preventDefault(); progFocus(opts[Math.max(0, i - 1)]); }
  else if(e.key === "Home"){ e.preventDefault(); progFocus(opts[0]); }
  else if(e.key === "End"){ e.preventDefault(); progFocus(opts[opts.length - 1]); }
  else if(e.key === "Enter" || e.key === " "){ e.preventDefault(); if(opts[i]) progPick(opts[i].dataset.v); }
  else if(e.key === "Escape" || e.key === "Tab"){ progOpen(false); if(e.key === "Escape"){ e.stopPropagation(); $("prog-btn").focus(); } }
});
document.addEventListener("click", e => { if(!e.target.closest("#prog")) progOpen(false); });
/* people stepper */
document.querySelectorAll("[data-step]").forEach(b => b.addEventListener("click", () => {
  const f = $("f-people"); f.value = Math.max(1, Math.min(20, (parseInt(f.value, 10) || 1) + +b.dataset.step)); updateMsg();
}));
document.querySelector(".st-v").addEventListener("click", () => $("f-people").focus());
$("f-people").addEventListener("blur", () => { const f = $("f-people"); f.value = Math.max(1, Math.min(20, parseInt(f.value, 10) || 1)); updateMsg(); });
function syncPeople(){
  const n = Math.max(1, Math.min(20, parseInt($("f-people").value, 10) || 1)), m10 = n % 10, m100 = n % 100;
  $("pp-unit").textContent = lang === "ru" ? (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? "человека" : "человек") : (n === 1 ? "person" : "people");
  $("pp-minus").disabled = n <= 1; $("pp-plus").disabled = n >= 20;
}
function renderNativeSelect(){
  const keep = $("f-prog").value || quiz.pick;
  $("f-prog").innerHTML = GROUPS.map(g => `<optgroup label="${esc(g[lang])}">${g.items.map(i=>`<option value="${i.id}">${esc(i[lang])} · ${money(i)}</option>`).join("")}</optgroup>`).join("");
  if(keep && ALL.some(i => i.id === keep)) $("f-prog").value = keep;
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
             $("f-photo").checked ? T("да, хочу","yes please") : "", $("f-note").value];
  return [L[0], ...v.map((x,i)=> x && String(x).trim() ? `${L[i+1]}: ${String(x).trim()}` : null)].filter(Boolean).join("\n");
}
function waLink(text){ return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`; }
function updateMsg(){
  const m = message();
  $("msg").textContent = m;
  $("go-wa").href = waLink(m);
  const it = quiz.pick && ALL.find(i => i.id === quiz.pick);
  const hi = it ? T(`Привет, Настя! Хочу записаться: ${it.ru}.`, `Hi Nastya! I'd like to book: ${it.en}.`)
               : T("Привет, Настя! Хочу записаться на погружение в Нячанге.", "Hi Nastya! I'd like to book a dive in Nha Trang.");
  $("hero-wa").href = waLink(hi);
  syncProg(); syncPeople(); syncDates();
}
function applyLang(){
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang;
  $("lang-ru").setAttribute("aria-pressed", lang==="ru");
  $("lang-en").setAttribute("aria-pressed", lang==="en");
  $("intro-skip") && ($("intro-skip").textContent = T("Пропустить ›","Skip ›"));
  renderTabs(); renderList(); renderQuiz(); renderSelect(); updateMsg(); hideTip();
  if(typeof renderMaps === "function") renderMaps();
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
$("q-body").addEventListener("click", e => {
  const p = e.target.closest("[data-path]");
  if(p){ quiz.path = p.dataset.path; quiz.step = quiz.path; quiz.pick = null; setTab(quiz.path); renderQuiz(); $("q-body").querySelector(".q-opt")?.focus({preventScroll:true}); return; }
  const q = e.target.closest("[data-q]");
  if(q){ quiz.pick = q.dataset.q; quiz.step = "done"; saveQuiz(); renderQuiz(); $("f-prog").value = quiz.pick; updateMsg(); return; }
  if(e.target.closest("[data-qback]")){ quiz.step = "q1"; renderQuiz(); return; }
  if(e.target.closest("[data-qredo]")){ quiz = {step:"q1", path:null, pick:null}; try{ localStorage.removeItem("quiz"); }catch(err){} renderQuiz(); updateMsg(); $("quiz").scrollIntoView({behavior: smooth(), block:"nearest"}); return; }
});
$("tabs").addEventListener("click", e => { const b=e.target.closest("[data-tab]"); if(b) setTab(b.dataset.tab); });
$("tabs").addEventListener("keydown", e => {
  if(e.key!=="ArrowRight" && e.key!=="ArrowLeft") return;
  const i = GROUPS.findIndex(g=>g.id===tab);
  const n = (i + (e.key==="ArrowRight"?1:-1) + GROUPS.length) % GROUPS.length;
  e.preventDefault(); setTab(GROUPS[n].id, true);
});
document.addEventListener("click", e => {
  const b = e.target.closest("[data-pick]"); if(!b) return;
  $("f-prog").value = b.dataset.pick; updateMsg();
  $("book").scrollIntoView({behavior: smooth()});
  setTimeout(() => { try{ $("f-name").focus({preventScroll:true}); }catch(err){} }, 700);
});
$("f").addEventListener("input", updateMsg);
$("f").addEventListener("change", updateMsg);
$("f").addEventListener("submit", e => e.preventDefault());
$("copy").addEventListener("click", () => {
  const m = message();
  const done = () => $("toast").textContent = T("Скопировано. Вставь в чат Telegram.","Copied. Paste it into Telegram.");
  try{ navigator.clipboard.writeText(m).then(done).catch(selectMsg); }catch(e){ selectMsg(); }
});
function selectMsg(){
  const r=document.createRange(); r.selectNodeContents($("msg"));
  const s=getSelection(); s.removeAllRanges(); s.addRange(r);
  $("toast").textContent = T("Текст выделен: скопируй его вручную.","Text selected: copy it manually.");
}
const today = new Date(); const iso = new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);

/* trip dates: Air Datepicker (vendor/air-datepicker-*.js) in range mode; hidden f-from / f-to keep ISO dates for the message and the backend */
const ADP_LOCALE = {
  ru:{days:["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"],daysShort:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],daysMin:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
      months:["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],monthsShort:["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],
      today:"Сегодня",clear:"Очистить",dateFormat:"dd.MM.yyyy",timeFormat:"HH:mm",firstDay:1},
  en:{days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],daysMin:["Su","Mo","Tu","We","Th","Fr","Sa"],
      months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      today:"Today",clear:"Clear",dateFormat:"MM/dd/yyyy",timeFormat:"hh:mm aa",firstDay:1}
};
const isoOf = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
let dp = null;
function dpOpts(){
  return {
    locale: ADP_LOCALE[lang], range: true, multipleDatesSeparator: " – ", minDate: new Date(new Date().setHours(0,0,0,0)),
    dateFormat: d => fmtDate(isoOf(d)), autoClose: true, toggleSelected: false, keyboardNav: true,
    isMobile: matchMedia("(max-width:560px)").matches, position: "bottom left", buttons: ["clear"],
    prevHtml: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    nextHtml: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    navTitles: {days: "<b>MMMM</b>&nbsp;yyyy"},
    onSelect: ({date}) => {
      const [a, b] = Array.isArray(date) ? date : (date ? [date] : []);
      $("f-from").value = a ? isoOf(a) : ""; $("f-to").value = b ? isoOf(b) : "";
      updateMsg();
    }
  };
}
function syncDates(){
  const a = $("f-from").value, b = $("f-to").value;
  $("f-dates").placeholder = T("Когда ты в Нячанге?", "When are you in Nha Trang?");
  if(dp){
    if(dp.__lang !== lang){ dp.__lang = lang; dp.update({locale: ADP_LOCALE[lang]}, {silent: true}); }
    $("f-dates").value = a ? (b && b !== a ? `${fmtDate(a)} – ${fmtDate(b)}` : fmtDate(a) + (b ? "" : " – …")) : "";
  }
  const n = a && b ? Math.round((new Date(b) - new Date(a)) / 864e5) + 1 : 0, m10 = n % 10, m100 = n % 100;
  $("f-nights").textContent = n ? (lang === "ru" ? `${n} ${m10 === 1 && m100 !== 11 ? "день" : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? "дня" : "дней"}` : `${n} day${n > 1 ? "s" : ""}`) : "";
}
if(window.AirDatepicker){
  dp = new AirDatepicker("#f-dates", dpOpts()); dp.__lang = lang;
  addEventListener("resize", () => { const mob = matchMedia("(max-width:560px)").matches; if(dp && dp.opts.isMobile !== mob){ if(dp.visible) dp.hide(); dp.update({isMobile: mob}, {silent: true}); } });
} else {
  // library failed to load: fall back to two native date fields
  $("f-dates").closest(".fld").hidden = true;
  ["f-from","f-to"].forEach(id => { const f = $(id); f.type = "date"; f.min = iso; f.className = "dates-fallback"; f.addEventListener("change", updateMsg); $("f-dates").closest(".fld").after(f); });
}

$("go-tg").href = $("c-tg-a").href = $("hi-tg").href = `https://t.me/${CONTACT.telegram}`;
$("c-wa-a").href = `https://wa.me/${CONTACT.whatsapp}`;
$("c-ig-a").href = `https://instagram.com/${CONTACT.instagram}`;
$("c-tg").textContent = "@" + CONTACT.telegram;
$("c-wa").textContent = "+" + CONTACT.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/,"$1 $2 $3 $4");
$("c-ig").textContent = "@" + CONTACT.instagram;
if(quiz.pick) tab = quiz.path;

/* ===== scroll effects: depth gauge, reveals ===== */
(function(){
  const gauge = $("gauge"), gv = $("g-val");
  const secs = [...document.querySelectorAll("section[data-depth]")];
  let ticking = false;
  function onScroll(){
    ticking = false;
    const y = scrollY, vh = innerHeight;
    // depth = interpolated between the sections' data-depth values
    let d = 0;
    for(const s of secs){ const r = s.getBoundingClientRect(); if(r.top < vh * .5) d = +s.dataset.depth + Math.min(1, Math.max(0, (vh * .5 - r.top) / r.height)) * 3; }
    d = Math.min(30, d);
    gauge.classList.toggle("on", y > vh * .5);
    gauge.style.setProperty("--g", (d / 30 * 100).toFixed(1) + "%");
    gv.textContent = d.toFixed(0) + " m";
  }
  addEventListener("scroll", () => { if(!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  addEventListener("resize", onScroll);
  onScroll();
  const els = document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){ els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }), {rootMargin:"0px 0px -8% 0px", threshold:.08});
  els.forEach(e => io.observe(e));
})();

/* ===== videos: play on tap, pause when scrolled away ===== */
document.querySelectorAll(".mo video").forEach(v => {
  const fig = v.closest(".mo"), btn = fig.querySelector(".play");
  btn && btn.addEventListener("click", () => { v.controls = true; v.play().then(() => fig.classList.add("on")).catch(() => {}); });
  v.addEventListener("pause", () => { if(v.ended) fig.classList.remove("on"); });
  if("IntersectionObserver" in window) new IntersectionObserver(es => es.forEach(en => { if(!en.isIntersecting && !v.paused) v.pause(); }), {threshold:0}).observe(v);
});
