/* ===== EDIT HERE: contacts ===== */
const CONTACT = { telegram:"poopsickk", whatsapp:"84559110497", instagram:"nastya.dives" };

/* ===== EDIT HERE: glossary ===== */
const TERMS = {
 dsd:{t:"Discover Scuba",ru:"Пробное погружение для тех, у кого ещё не было погружений. Инструктор всё время рядом, сертификат не нужен.",en:"A try dive for people who have never dived. The instructor stays with you; no certificate needed."},
 fun:{t:"Fun dives",ru:"Погружения для тех, у кого уже есть сертификат. Без обучения, просто ныряем с гидом и смотрим риф.",en:"Dives for certified divers. No training, just exploring the reef with a guide."},
 ow:{t:"Open Water",ru:"Первый курс PADI. После него можно нырять до 18 м с напарником в любой стране.",en:"The first PADI course. Afterwards you can dive to 18 m with a buddy anywhere in the world."},
 aow:{t:"Advanced",ru:"Следующий курс после Open Water: глубина до 30 м, навигация, плавучесть.",en:"The course after Open Water: depth to 30 m, navigation and buoyancy."},
 nitrox:{t:"Nitrox",ru:"Воздух с повышенным содержанием кислорода. Позволяет дольше оставаться на глубине.",en:"Air with extra oxygen. It lets you stay longer at depth."},
 refresh:{t:"Refresher",ru:"Короткое повторение навыков, если последнее погружение было давно.",en:"A short skills review if you haven't dived in a while."},
 elearn:{t:"eLearning",ru:"Онлайн-теория PADI: проходишь на телефоне до приезда.",en:"PADI online theory you do on your phone before you arrive."},
 rescue:{t:"Rescue Diver",ru:"Курс, где учишься помогать себе и напарнику в сложных ситуациях.",en:"The course where you learn to handle problems and help your buddy."},
 bubble:{t:"Bubblemaker",ru:"Первое знакомство с аквалангом для детей 8–9 лет, на глубине до 2 м.",en:"A first taste of scuba for kids aged 8–9, to 2 m."}
};

/* ===== EDIT HERE: prices (USD) — from the Rainbow Divers price booklet ===== */
/* items: bookable programmes. adds: surcharges shown under the group, not bookable on their own */
const GROUPS = [
 {id:"first", ru:"Пробные погружения", en:"Try dives", sub_ru:"Без сертификата, с инструктором", sub_en:"No certificate needed, with an instructor", items:[
  {id:"dsd95", rec:true, term:"dsd", price:95, ru:"Пробное погружение: 2 погружения", en:"Discover Scuba: 2 dives", meta_ru:["онлайн-теория","инструктаж","2 погружения с лодки"], meta_en:["eLearning","briefing","2 boat dives"],
   d_ru:"Два погружения до 12 м с инструктором. Сертификат не нужен.", d_en:"Two dives to 12 m with an instructor. No certificate needed."},
  {id:"dsd135", term:"dsd", price:135, ru:"Пробное с бассейном: 2 погружения", en:"Discover Scuba with pool: 2 dives", meta_ru:["онлайн-теория","бассейн","2 погружения с лодки"], meta_en:["eLearning","pool session","2 boat dives"],
   d_ru:"Сначала занятие в бассейне, потом два погружения в море.", d_en:"A pool session first, then two dives at sea."},
  {id:"dsd65", price:65, ru:"1 пробное погружение + снорклинг", en:"1 try dive + snorkelling", meta_ru:["1 погружение с лодки","снорклинг"], meta_en:["1 boat dive","snorkelling"],
   d_ru:"Одно погружение с инструктором, остальное время плаваешь с маской.", d_en:"One dive with an instructor, then snorkelling for the rest of the trip."},
  {id:"bubble", term:"bubble", price:60, ru:"Bubblemaker, дети 8–9 лет", en:"Bubblemaker, kids aged 8–9", meta_ru:["до 2 м"], meta_en:["to 2 m"],
   d_ru:"Первое знакомство с аквалангом для детей, глубина не больше 2 м.", d_en:"A first taste of scuba for kids, no deeper than 2 m."}
 ]},
 {id:"snork", ru:"Снорклинг и пассажиры", en:"Snorkelling & passengers", sub_ru:"Для тех, кто едет на лодку, но не ныряет", sub_en:"For people who come on the boat but don't dive", items:[
  {id:"snork40", price:40, ru:"Снорклинг / пассажир", en:"Snorkelling / passenger", meta_ru:["маска и трубка","обед"], meta_en:["mask & snorkel","lunch"],
   d_ru:"День на лодке с друзьями или семьёй, плаваешь с маской сам.", d_en:"A day on the boat with friends or family, snorkelling on your own."},
  {id:"snork50", price:50, ru:"Снорклинг PADI с гидом", en:"PADI snorkelling with a guide", meta_ru:["с гидом","маска и трубка","обед"], meta_en:["guided","mask & snorkel","lunch"],
   d_ru:"Плаваешь с маской вместе с гидом, он показывает риф.", d_en:"Snorkel with a guide who shows you around the reef."}
  ], adds:[
  {price:30, ru:"Пробное погружение к снорклингу", en:"Try dive added to snorkelling"},
  {price:0, ru:"Дети до 5 лет — бесплатно, под присмотром родителей", en:"Under-5s free, under your supervision"}
 ]},
 {id:"cert", ru:"Fun dives", en:"Fun dives", sub_ru:"Для тех, у кого есть сертификат", sub_en:"For certified divers", items:[
  {id:"fun1", term:"fun", price:55, ru:"Fun dive: 1 погружение", en:"Fun dive: 1 dive", meta_ru:["с гидом","7:30–14:00"], meta_en:["guided","7:30am–2pm"],
   d_ru:"Одно погружение с гидом у островов.", d_en:"One guided dive around the islands."},
  {id:"fun2", rec:true, term:"fun", price:80, ru:"Fun dives: 2 погружения", en:"Fun dives: 2 dives", meta_ru:["с гидом","7:30–14:00"], meta_en:["guided","7:30am–2pm"],
   d_ru:"Два погружения на разных сайтах за один выход в море.", d_en:"Two dives at two sites on one trip."},
  {id:"fun3", term:"fun", price:100, ru:"Fun dives: 3 погружения", en:"Fun dives: 3 dives", meta_ru:["с гидом","по расписанию"], meta_en:["guided","subject to schedule"],
   d_ru:"Три погружения за день, если позволяет расписание лодки.", d_en:"Three dives in a day when the boat schedule allows."},
  {id:"night", price:75, ru:"Ночное погружение с лодки", en:"Night dive from the boat", meta_ru:["от 2 дайверов"], meta_en:["2+ divers"],
   d_ru:"Выход с лодки вечером, нужно минимум 2 дайвера.", d_en:"An evening boat dive, minimum 2 divers."},
  {id:"nightb", price:50, ru:"Ночное погружение с пляжа", en:"Night dive from the beach", meta_ru:["с пляжа"], meta_en:["shore dive"],
   d_ru:"Ночное погружение с берега.", d_en:"A night dive from the shore."},
  {id:"refresh", term:"refresh", price:50, ru:"Рефрешер", en:"Refresher", meta_ru:["бассейн / пляж / лодка"], meta_en:["pool / beach / boat"],
   d_ru:"Повторяем навыки в рамках первого погружения, если давно не было погружений.", d_en:"A skills review as part of your first dive if you haven't dived in a while."},
  {id:"speed", price:75, unit:{ru:"/ чел. в день",en:"/ person / day"}, ru:"Частный катер", en:"Private speedboat", meta_ru:["2–4 человека","Electric Nose"], meta_en:["2–4 people","Electric Nose"],
   d_ru:"Свой график и дальние сайты: The Wall 42 м, The Ravine 25 м, Ray Plateau 30 м, The Freefall 40 м. Для курсов и fun dives.", d_en:"Your own schedule and remote sites: The Wall 42 m, The Ravine 25 m, Ray Plateau 30 m, The Freefall 40 m. For courses and fun dives."}
  ], adds:[
  {price:50, ru:"Онлайн-теория к рефрешеру (по желанию)", en:"Online theory for the refresher (optional)"}
 ]},
 {id:"courses", ru:"Курсы PADI", en:"PADI courses", sub_ru:"С сертификатом PADI в конце", sub_en:"Each ends with a PADI certification", items:[
  {id:"ow", rec:true, term:"ow", price:450, ru:"Open Water", en:"Open Water", meta_ru:["полдня бассейн","2 утра в море","4 погружения","с 10 лет"], meta_en:["half-day pool","2 mornings at sea","4 dives","age 10+"],
   d_ru:"Первый сертификат дайвера, до 18 м. $150 онлайн-теория PADI + $300 бассейн и море. Страховка DAN в подарок.", d_en:"Your first dive licence, to 18 m. $150 PADI eLearning + $300 pool and ocean training. Free DAN insurance."},
  {id:"aow", term:"aow", price:495, ru:"Advanced + Nitrox", en:"Advanced + Nitrox", meta_ru:["2 дня","5 погружений","до 30 м"], meta_en:["2 days","5 dives","to 30 m"],
   d_ru:"Следующий курс после Open Water плюс специализация Nitrox.", d_en:"The course after Open Water plus the Nitrox specialty."},
  {id:"owaow", price:795, ru:"Open Water + Advanced + Nitrox", en:"Open Water + Advanced + Nitrox", meta_ru:["5 дней","9 погружений"], meta_en:["5 days","9 dives"],
   d_ru:"С нуля до Advanced за одну поездку.", d_en:"From zero to Advanced in one trip."},
  {id:"rescue", term:"rescue", price:350, ru:"Rescue Diver", en:"Rescue Diver", meta_ru:["онлайн-теория","полдня бассейн","2 утра в море"], meta_en:["eLearning","half-day pool","2 mornings at sea"],
   d_ru:"Курс, где учишься помогать себе и напарнику в сложных ситуациях.", d_en:"Learn to handle problems and help your buddy."},
  {id:"efr", price:150, ru:"EFR — первая помощь", en:"EFR — first aid", meta_ru:["нужен для Rescue"], meta_en:["needed for Rescue"],
   d_ru:"Курс первой помощи Emergency First Response.", d_en:"The Emergency First Response first-aid course."},
  {id:"pack", price:1000, ru:"Пакет: Advanced + Nitrox + Rescue + EFR + Deco Chamber", en:"Bundle: Advanced + Nitrox + Rescue + EFR + Deco Chamber", meta_ru:["всё вместе"], meta_en:["all in one"],
   d_ru:"Пять курсов одним пакетом.", d_en:"Five courses in one bundle."},
  {id:"spec", price:125, from:true, ru:"Специализации", en:"Specialties", meta_ru:["с онлайн-теорией"], meta_en:["with eLearning"],
   d_ru:"Deep, Nitrox, Night, навигация, плавучесть и другие. Полный список ниже.", d_en:"Deep, Nitrox, Night, Navigation, Buoyancy and more. Full list below."}
  ], adds:[
  {price:50, ru:"Nitrox к курсу Open Water", en:"Nitrox added to Open Water"},
  {price:200, ru:"Advanced к курсу Open Water (+ стоимость онлайн-теории)", en:"Advanced added to Open Water (+ eLearning fee)"},
  {price:175, ru:"Nitrox к курсу Rescue", en:"Nitrox added to Rescue"},
  {price:150, ru:"Deco Chamber к курсу Rescue", en:"Deco Chamber added to Rescue"}
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
  {path:"first", ru:"Пока нет", en:"Not yet", s_ru:"Пробное погружение, сертификат не нужен", s_en:"A try dive, no certificate needed"},
  {path:"courses", ru:"Хочу научиться", en:"I want to learn", s_ru:"Курс PADI и сертификат", s_en:"A PADI course and certification"},
  {path:"cert", ru:"Да, есть сертификат", en:"Yes, I'm certified", s_ru:"Fun dives у островов", s_en:"Fun dives around the islands"},
  {path:"snork", ru:"Нырять не буду", en:"I won't dive", s_ru:"Снорклинг или просто на лодку", s_en:"Snorkelling or just the boat trip"}]},
 first:{ru:"Какое пробное погружение?", en:"Which try dive?", opts:[
  {pick:"dsd95", ru:"2 погружения с лодки", en:"2 boat dives", why_ru:"Онлайн-теория, инструктаж на лодке и два погружения до 12 м. Инструктор всё время рядом.", why_en:"eLearning, a briefing on the boat and two dives to 12 m. The instructor stays with you the whole time."},
  {pick:"dsd135", ru:"Бассейн + 2 погружения с лодки", en:"Pool + 2 boat dives", why_ru:"Сначала занятие в бассейне, где отрабатываем навыки на мелкой воде. Потом два погружения в море до 12 м.", why_en:"First a pool session to practise the skills in shallow water, then two dives at sea to 12 m."},
  {pick:"dsd65", ru:"1 погружение + снорклинг", en:"1 dive + snorkelling", why_ru:"Одно погружение с инструктором, остальное время плаваешь с маской над рифом.", why_en:"One dive with an instructor, then snorkelling over the reef for the rest of the trip."},
  {pick:"bubble", ru:"Ребёнок 8–9 лет", en:"A child aged 8–9", why_ru:"Bubblemaker: ребёнок дышит из акваланга на глубине до 2 м под присмотром инструктора.", why_en:"Bubblemaker: your child breathes from a real scuba set no deeper than 2 m, with an instructor watching."}]},
 courses:{ru:"Какой курс?", en:"Which course?", opts:[
  {pick:"ow", ru:"Open Water", en:"Open Water", why_ru:"Первый курс: онлайн-теория дома, здесь полдня бассейн и два утра в море. После него можно нырять с напарником до 18 м в любой стране.", why_en:"Your first course: eLearning at home, then half a day in the pool and two mornings at sea. Afterwards you can dive with a buddy to 18 m anywhere."},
  {pick:"owaow", ru:"Open Water + Advanced + Nitrox", en:"Open Water + Advanced + Nitrox", why_ru:"С нуля до Advanced за одну поездку: 5 дней, 9 погружений, глубина до 30 м.", why_en:"From zero to Advanced in one trip: 5 days, 9 dives, depth to 30 m."},
  {pick:"aow", ru:"Advanced + Nitrox (уже есть Open Water)", en:"Advanced + Nitrox (I have Open Water)", why_ru:"2 дня и 5 погружений: глубина до 30 м, навигация и найтрокс.", why_en:"2 days and 5 dives: depth to 30 m, navigation and nitrox."},
  {pick:"rescue", ru:"Rescue Diver", en:"Rescue Diver", why_ru:"Учишься замечать проблемы заранее и помогать напарнику. EFR (первая помощь) — отдельно, $150.", why_en:"Learn to spot problems early and help your buddy. EFR first aid is separate, $150."}]},
 cert:{ru:"Что хочешь?", en:"What would you like?", opts:[
  {pick:"fun2", ru:"Fun dives: 2 погружения", en:"Fun dives: 2 dives", why_ru:"Два погружения с гидом у Хон Мун за один выход. Маршруты можно посмотреть на картах ниже.", why_en:"Two guided dives around Hon Mun on one trip. Check the routes on the maps below."},
  {pick:"refresh", ru:"Рефрешер: давно не было погружений", en:"Refresher, it's been a while", why_ru:"Повторяем навыки в рамках первого погружения, дальше ныряем как обычно.", why_en:"We go over the skills as part of your first dive, then dive as usual."},
  {pick:"speed", ru:"Частный катер, дальние сайты", en:"Private speedboat, remote sites", why_ru:"Катер на 2–4 человека к Electric Nose: The Wall 42 м, Ray Plateau 30 м, The Freefall 40 м, и график под вас.", why_en:"A speedboat for 2–4 people to Electric Nose: The Wall 42 m, Ray Plateau 30 m, The Freefall 40 m, on your schedule."},
  {pick:"night", ru:"Ночное погружение", en:"Night dive", why_ru:"Ночью риф совсем другой: выходят охотники, а планктон светится от каждого движения руки. С лодки $75 (от 2 дайверов), с пляжа $50.", why_en:"The reef is a different place at night: hunters come out and the plankton lights up when you move your hand. Boat $75 (2+ divers), beach $50."}]},
 snork:{ru:"Что выбрать?", en:"Which one?", opts:[
  {pick:"snork40", ru:"Снорклинг / пассажир", en:"Snorkelling / passenger", why_ru:"День на лодке: плаваешь с маской сам, обед включён. Пробное погружение можно добавить за $30.", why_en:"A day on the boat snorkelling on your own, lunch included. You can add a try dive for $30."},
  {pick:"snork50", ru:"Снорклинг PADI с гидом", en:"PADI snorkelling with a guide", why_ru:"Плаваешь с маской вместе с гидом. Пробное погружение можно добавить за $30.", why_en:"Snorkel with a guide. You can add a try dive for $30."}]}
};

const ALL = GROUPS.flatMap(g => g.items.map(i => ({...i, group:g})));
let lang = "en", quiz = {step:"q1", path:null, pick:null};
try{ const s = localStorage.getItem("lang"); if(s==="ru"||s==="en") lang = s; else if((navigator.language||"").toLowerCase().startsWith("ru")) lang = "ru"; }catch(e){ if((navigator.language||"").toLowerCase().startsWith("ru")) lang = "ru"; }
try{ const q = JSON.parse(localStorage.getItem("quiz") || "null"); if(q && QUIZ[q.path] && q.pick) quiz = {step:"done", path:q.path, pick:q.pick}; }catch(e){}

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = i => `${i.from ? (lang==="ru"?"от ":"from ") : ""}$${i.price.toLocaleString("en-US")}`;
const T = (ru, en) => lang === "ru" ? ru : en;

function title(i){
  const t = esc(i[lang]);
  return i.term ? `<button type="button" class="term" data-term="${i.term}">${t}</button>` : t;
}
function itemHTML(i){
  return `<article class="item${i.rec?" rec":""}">
      <div class="name"><h4>${title(i)}</h4>${i.rec?`<span class="badge">${T("советую","my pick")}</span>`:""}</div>
      ${(i["meta_"+lang]||[]).length?`<div class="meta">${i["meta_"+lang].map(esc).join("  ·  ")}</div>`:"<div></div>"}
      <p>${esc(i["d_"+lang]||"")}</p>
      <div class="row"><span class="price">${money(i)}${i.unit?`<small>${esc(i.unit[lang])}</small>`:""}</span>
        <button type="button" class="btn sm${i.rec?" primary":""}" data-pick="${esc(i.id)}">${T("Записаться","Book this")}</button></div>
    </article>`;
}
function renderList(){
  $("pgroups").innerHTML = GROUPS.map(g => `
    <section class="pgroup" id="pg-${g.id}" aria-labelledby="pgh-${g.id}">
      <div class="pg-head"><h3 id="pgh-${g.id}">${esc(g[lang])}</h3><p>${esc(g["sub_"+lang]||"")}</p></div>
      <div class="plist">${g.items.map(itemHTML).join("")}</div>
      ${g.adds?`<ul class="adds">${g.adds.map(a => `<li><span>${esc(a[lang])}</span><b>${a.price?"+$"+a.price:""}</b></li>`).join("")}</ul>`:""}
      ${g.id==="courses"?`<details class="spec">
        <summary>${T("Все специализации PADI (с онлайн-теорией)","All PADI specialties (with eLearning)")}</summary>
        <div class="tw"><table>${SPECIALTIES.map(([n,d,p]) => `<tr><td>${esc(n)} <span class="muted">${d==="—"?"":"· "+d+T(" погр."," dives")}</span></td><td>$${p}</td></tr>`).join("")}</table></div>
        <p class="small" style="margin-top:12px">${T("PADI Master Scuba Diver: заявка бесплатно, если есть 5 специализаций, Rescue и 50+ погружений.","PADI Master Scuba Diver: free application once you have 5 specialties, Rescue and 50+ dives.")}</p>
      </details>`:""}
    </section>`).join("");
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
  renderList(); renderQuiz(); renderSelect(); updateMsg(); hideTip();
  if(typeof renderMaps === "function") renderMaps();
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
  if(p){ quiz.path = p.dataset.path; quiz.step = quiz.path; quiz.pick = null; renderQuiz(); $("q-body").querySelector(".q-opt")?.focus({preventScroll:true}); return; }
  const q = e.target.closest("[data-q]");
  if(q){ quiz.pick = q.dataset.q; quiz.step = "done"; saveQuiz(); renderQuiz(); $("f-prog").value = quiz.pick; updateMsg(); return; }
  if(e.target.closest("[data-qback]")){ quiz.step = "q1"; renderQuiz(); return; }
  if(e.target.closest("[data-qredo]")){ quiz = {step:"q1", path:null, pick:null}; try{ localStorage.removeItem("quiz"); }catch(err){} renderQuiz(); updateMsg(); $("quiz").scrollIntoView({behavior: smooth(), block:"nearest"}); return; }
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
