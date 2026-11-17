/* ===== Interactive dive-site maps =====
   Drawn as SVG from the data below, so every label follows the page language.
   Coordinates are in a 1000 × 625 box; route points are [x, y, depth in metres]. */

const SITES = [
 {id:"cemetery", name:"Cemetery Bay", where:{ru:"Хон Мун, Нячанг", en:"Hon Mun, Nha Trang"},
  land:"forest", north:0,
  shore:[[-30,-30],[1030,-30],[1030,282],[960,292],[910,296],[850,276],[800,232],[772,172],[748,112],[704,62],[640,40],[560,30],[470,28],[380,34],[300,52],[236,84],[178,128],[112,160],[46,184],[-30,196]],
  islands:[],
  deep:"s",
  reefs:[[150,205,60,26],[300,120,70,30],[690,135,55,20],[820,300,70,30],[930,330,60,22],[640,430,50,24],[760,470,90,34],[870,470,60,26],[500,175,40,12],[245,250,60,18]],
  rocks:[[640,420],[662,445],[625,450],[905,318],[950,330],[820,505],[860,520],[690,470]],
  sand:[[340,78,70],[420,330,60]],
  depths:[[300,300,"5 m"],[230,470,"12 m"],[560,560,"18 m+"],[930,560,"15 m"]],
  pois:[
   {x:581,y:226,k:"moor",d:"4 m",ru:"Швартовка",en:"Mooring",n_ru:"Спуск и подъём по линии",n_en:"Descent and ascent on the line"},
   {x:340,y:82,k:"sand",d:"1–3 m",ru:"Мелкий песок",en:"Shallow sand",n_ru:"Светлое дно у пляжа",n_en:"Bright sand by the beach"},
   {x:432,y:278,k:"nav",d:"7 m",ru:"Навигационный квадрат",en:"NAV square",n_ru:"Тренировки навигации на курсах",n_en:"Used for navigation practice"},
   {x:512,y:312,k:"tire",d:"10 m",ru:"Покрышка",en:"Car tire",n_ru:"Ориентир на пути к склону",n_en:"Landmark on the way to the slope"},
   {x:712,y:150,k:"coral",d:"2–3 m",ru:"Кораллы",en:"Coral garden",n_ru:"Мелко и светло, следи за ластами",n_en:"Shallow and bright, mind your fins"},
   {x:640,y:432,k:"rock",d:"8 m",ru:"Камни",en:"Rock cluster",n_ru:"Мурены прячутся в щелях",n_en:"Moray eels hide in the cracks"},
   {x:842,y:470,k:"wall",d:"13 m",ru:"Стенка",en:"Wall",n_ru:"Вдоль стенки на восток",n_en:"Follow it east"},
   {x:372,y:590,k:"deep",d:"18 m",ru:"Глубокий склон",en:"Deep slope",n_ru:"Склон уходит глубже 18 м: смотри на компьютер",n_en:"Keeps going below 18 m: watch your computer"}
  ],
  routes:[
   {c:"#ff6b5b", ru:"Коралловая петля", en:"Coral loop", depth:"2–8 m", time:40, best:"DSD · OW",
    s_ru:["От швартовки на юг вдоль рифа к камням (8 м)","На север над кораллами (2–3 м)","Маленькая петля севернее лодки и назад"],
    s_en:["From the mooring south along the reef to the rocks (8 m)","North over the coral (2–3 m)","A small loop north of the boat, then back"],
    pts:[[581,226,4],[592,300,6],[604,378,8],[640,432,8],[690,400,7],[716,322,5],[692,242,3],[642,176,2],[576,118,2],[510,120,3],[490,176,3],[530,214,4],[581,226,4]]},
   {c:"#ffc94a", ru:"Стенка и камни", en:"Wall and rocks", depth:"4–13 m", time:45, best:"OW · AOW",
    s_ru:["От швартовки на юг мимо камней","Вдоль стенки (13 м) на восток, вокруг внешних камней","Назад на запад вдоль стенки к лодке"],
    s_en:["From the mooring south past the rocks","East along the wall (13 m), around the outer rocks","Back west along the wall to the boat"],
    pts:[[581,226,4],[602,292,6],[626,372,8],[684,436,10],[764,452,12],[842,452,13],[902,420,13],[936,372,12],[950,430,13],[912,508,13],[822,530,13],[730,494,12],[664,446,10],[622,334,7],[581,226,4]]},
   {c:"#a98bff", ru:"Глубокий склон", en:"Deep slope", depth:"4–18 m", time:40, best:"AOW · Deep",
    s_ru:["От швартовки на юго-запад мимо покрышки (10 м)","Вниз по песчаному склону до 18 м","Тем же путём назад к линии"],
    s_en:["From the mooring south-west past the car tire (10 m)","Down the sandy slope to 18 m","The same way back to the line"],
    pts:[[581,226,4],[522,262,7],[474,330,10],[434,420,13],[402,510,16],[372,590,18],[392,596,18],[420,512,16],[452,424,13],[492,336,10],[536,270,7],[581,226,4]]}
  ],
  facts:[["Тип","Type","Закрытая бухта, кораллы и камни","Sheltered bay, coral and rocks"],
         ["Глубина","Depth","2–18 м","2–18 m"],["Уровень","Level","DSD · OW · AOW","DSD · OW · AOW"],
         ["Видимость","Visibility","5–20 м, лучше всего март–июнь","5–20 m, best March–June"],
         ["Течение","Current","Нет или умеренное, сильнее в окт–янв","None to moderate, stronger Oct–Jan"],
         ["Вода","Water","24–29 °C","24–29 °C"],["GPS","GPS","12.18212 N, 109.29394 E","12.18212 N, 109.29394 E"]],
  life:{ru:["Рифовые рыбы: попугаи, хирурги, единороги","Крылатки","Мурены в щелях камней","Голожаберные моллюски","Твёрдые и мягкие кораллы, луцианы"],
        en:["Reef fish: parrotfish, surgeonfish, unicornfish","Lionfish","Moray eels in rock crevices","Nudibranchs","Hard and soft corals, snappers and grunts"]},
  safety:{ru:["Лодки у швартовки: всплываем по линии","Склон идёт глубже 18 м, следи за глубиной","Прибой у камней и берега","Крылатки и ежи: не трогать","Мелкие кораллы: аккуратно с ластами","Заповедник: ничего не трогаем и не берём"],
          en:["Boats at the mooring: ascend on the line","The slope continues below 18 m, watch your depth","Surge near rocks and the shore","Lionfish and sea urchins: don't touch","Shallow coral: mind your fins","Marine park: no touching, no collecting"]}
 },

 {id:"madonna", name:"Madonna Rock", where:{ru:"Хон Мун, 5–10 минут на лодке",en:"Hon Mun, 5–10 min by boat"},
  land:"rock", north:null, current:{x:860,y:70,ang:0},
  shore:[],
  islands:[
   [[300,170],[380,140],[470,150],[540,190],[556,270],[548,360],[520,430],[450,456],[370,446],[300,410],[272,330],[276,240]],
   [[560,200],[640,180],[720,200],[742,280],[728,360],[690,398],[620,400],[566,370],[556,290]],
   [[536,388],[600,376],[660,396],[672,440],[630,466],[560,462],[530,430]],
   [[132,392],[160,380],[176,398],[160,414],[136,410]],
   [[186,418],[210,410],[224,428],[204,442],[184,436]]
  ],
  deep:"nw",
  reefs:[[230,200,60,22],[230,380,50,18],[790,260,60,24],[780,420,60,22],[420,500,70,26],[120,300,50,16],[700,500,70,22],[600,120,60,14]],
  rocks:[[170,490],[200,500],[232,488],[248,508],[760,178],[786,190],[300,520]],
  sand:[[880,520,60],[120,560,50]],
  depths:[[880,236,"12 m"],[890,350,"10 m"],[890,470,"10 m"],[40,60,"30 m ↖"]],
  pois:[
   {x:546,y:100,k:"boat",d:"18 m",ru:"Quick Drop, верхняя лодка",en:"Quick Drop, upper boat",n_ru:"Быстрый спуск сразу на 18 м",n_en:"Straight down to 18 m"},
   {x:504,y:500,k:"moor",d:"7 m",ru:"Швартовка, нижняя лодка",en:"Mooring, lower boat",n_ru:"Линия спуска, сюда возвращаются все маршруты",n_en:"Descent line, every route ends here"},
   {x:214,y:350,k:"tunnel",d:"14 m",ru:"Трещина и проход-туннель",en:"Crack and swim-through",n_ru:"Проходим только с хорошей плавучестью",n_en:"Only with good buoyancy"},
   {x:770,y:184,k:"rock",d:"14 m",ru:"Два камня, проход",en:"Two stones, passage",n_ru:"Проплываем между камнями",n_en:"Swim between the stones"},
   {x:168,y:408,k:"rock",d:"0 m",ru:"Два камня над водой",en:"Two stones above water",n_ru:"Хорошо видно с лодки",n_en:"Visible from the boat"},
   {x:210,y:500,k:"rock",d:"17 m",ru:"L-образные камни",en:"L-shaped stones",n_ru:"Под водой, обходим снаружи",n_en:"Underwater, go round the outside"},
   {x:120,y:130,k:"wall",d:"18 m",ru:"Склон рифа",en:"Reef slope",n_ru:"Дальше обрыв до 30 м",n_en:"Then a drop-off to 30 m"}
  ],
  routes:[
   {c:"#ffc94a", ru:"Маршрут вдоль склона", en:"Slope route", depth:"7–18 m", time:45, best:"OW · AOW",
    s_ru:["От верхней лодки вдоль склона рифа","К трещине и проходу (14 м), к двум камням над водой","Дальше к L-образным камням и к нижней лодке"],
    s_en:["From the upper boat along the reef slope","To the crack and swim-through (14 m) and the two stones above water","On to the L-shaped stones and the lower boat"],
    pts:[[546,100,18],[440,104,18],[326,126,18],[236,200,16],[214,312,14],[214,350,14],[232,400,13],[300,456,11],[400,488,9],[504,500,7]]},
   {c:"#ff6b5b", ru:"Проход между камнями", en:"Stone passage", depth:"7–14 m", time:45, best:"OW · AOW",
    s_ru:["От нижней лодки вдоль правой стороны рифа","К двум камням и проходу между ними (14 м)","Назад вдоль рифа через 12–10 м к нижней лодке"],
    s_en:["From the lower boat along the right side of the reef","To the two stones and the passage between them (14 m)","Back along the reef through 12–10 m to the lower boat"],
    pts:[[504,500,7],[620,512,9],[740,486,10],[828,400,10],[850,300,12],[820,214,13],[770,184,14],[700,160,14],[650,170,14],[772,230,13],[782,330,11],[770,420,10],[700,470,9],[600,490,8],[504,500,7]]},
   {c:"#4fd8f0", ru:"Вокруг L-образных камней", en:"Around the L-stones", depth:"7–17 m", time:40, best:"AOW",
    s_ru:["От нижней лодки к L-образным камням (17 м)","Обходим их с внешней стороны","Возвращаемся к нижней лодке"],
    s_en:["From the lower boat to the L-shaped stones (17 m)","Go round them on the outside","Back to the lower boat"],
    pts:[[504,500,7],[400,540,12],[280,556,15],[160,540,17],[84,486,17],[72,410,16],[112,352,15],[200,360,14],[300,410,12],[404,470,9],[504,500,7]]}
  ],
  facts:[["Тип","Type","Скальный риф","Rocky reef"],["Глубина","Depth","обычно 10–18 м, макс. 30–35 м","usually 10–18 m, max 30–35 m"],
         ["Уровень","Level","OW · AOW","OW · AOW"],["Видимость","Visibility","8–20 м","8–20 m"],
         ["Течение","Current","Слабое или умеренное","Weak to moderate"],["Вода","Water","26–29 °C","26–29 °C"],
         ["Дно","Bottom","Камни, кораллы, песок","Rocks, coral, sand"]],
  life:{ru:["Рифовые рыбы","Скорпены (морской ёрш)","Крылатки","Мурены","Голожаберные моллюски","Креветки и крабы","Иногда каракатицы"],
        en:["Reef fish","Scorpionfish","Lionfish","Moray eels","Nudibranchs","Shrimps and crabs","Cuttlefish, sometimes"]},
  safety:{ru:["Течение может меняться","Прибой на мелководье","Острые кораллы и камни","Лодки при всплытии","Глубокая сторона: следи за глубиной","Нужна хорошая плавучесть","Не трогать кораллы и животных"],
          en:["The current can change","Surge in the shallows","Sharp coral and rocks","Boats when you surface","Deep side: watch your depth","Good buoyancy is a must","Don't touch coral or animals"]}
 },

 {id:"dambay", name:"Dam Bay", where:{ru:"Хон Тре, Нячанг",en:"Hon Tre, Nha Trang"},
  land:"forest", north:null,
  shore:[[-30,-30],[1030,-30],[1030,150],[960,140],[900,118],[830,92],[740,74],[640,76],[520,80],[400,84],[300,88],[218,96],[160,130],[120,190],[86,260],[46,320],[0,356],[-30,370]],
  islands:[],
  deep:"sw",
  reefs:[[520,215,120,70],[920,250,70,30],[160,310,60,22],[240,420,90,30],[420,470,90,26],[640,470,90,24],[860,420,70,22],[150,200,40,14],[760,160,40,14]],
  rocks:[[96,330],[60,380],[130,400],[180,440],[230,470],[110,450],[150,500],[820,108],[880,126]],
  sand:[[760,360,110],[540,560,90]],
  depths:[[176,128,"2–3 m"],[900,170,"2–3 m"],[950,240,"6 m"],[150,275,"2–3 m"],[200,420,"9–13 m"],[770,356,"10 m"]],
  pois:[
   {x:236,y:181,k:"moor",d:"3 m",ru:"Левая швартовка",en:"Left mooring",n_ru:"Старт всех трёх маршрутов",n_en:"All three routes start here"},
   {x:665,y:131,k:"moor",d:"3 m",ru:"Правая швартовка",en:"Right mooring",n_ru:"Вторая лодка",n_en:"The second boat"},
   {x:520,y:216,k:"coral",d:"4 m",ru:"Центральный риф",en:"Central reef",n_ru:"Главный коралловый участок",n_en:"The main coral patch"},
   {x:724,y:176,k:"bike",d:"4 m",ru:"Велосипед",en:"Bicycle",n_ru:"Затонувший велосипед, любимое фото",n_en:"A sunken bicycle, a favourite photo spot"},
   {x:120,y:380,k:"wall",d:"9–13 m",ru:"Скальная стенка",en:"Rock wall",n_ru:"Уходит до 9–13 м",n_en:"Drops to 9–13 m"}
  ],
  routes:[
   {c:"#ffc94a", ru:"Вокруг центрального рифа", en:"Round the central reef", depth:"2–4 m", time:40, best:"DSD · OW",
    s_ru:["От левой швартовки по мелководью 2–3 м","По часовой стрелке вокруг кораллов на 4 м","Назад к лодке"],
    s_en:["From the left mooring through the 2–3 m shallows","Clockwise round the coral patch at 4 m","Back to the boat"],
    pts:[[236,181,3],[262,122,2],[400,110,3],[570,116,3],[642,152,4],[646,216,4],[562,262,4],[440,252,4],[302,212,3],[236,181,3]]},
   {c:"#ff8a3d", ru:"К велосипеду", en:"To the bicycle", depth:"2–4 m", time:40, best:"OW",
    s_ru:["От левой швартовки по верхней части бухты к правой","Вокруг участка с велосипедом (4 м)","Назад вдоль центрального рифа"],
    s_en:["From the left mooring along the top of the bay to the right mooring","Round the bicycle area (4 m)","Back along the central reef"],
    pts:[[236,181,3],[204,150,3],[262,132,3],[420,124,3],[560,108,3],[665,131,3],[762,146,4],[796,192,4],[742,212,4],[622,192,4],[460,170,4],[330,190,3],[236,181,3]]},
   {c:"#c26bff", ru:"Скальная стенка", en:"Rock wall", depth:"3–13 m", time:45, best:"OW · AOW",
    s_ru:["От левой швартовки против часовой стрелки к скальной стенке 9–13 м","Вдоль нижней кромки рифа","Назад к лодке, обходя центральный риф"],
    s_en:["From the left mooring anticlockwise to the rock wall, 9–13 m","Along the lower edge of the reef","Back to the boat around the central reef"],
    pts:[[236,181,3],[172,240,4],[124,318,7],[146,376,10],[220,410,12],[340,380,11],[480,330,9],[640,310,8],[720,262,6],[690,196,5],[590,160,4],[430,166,4],[300,180,3],[236,181,3]]}
  ],
  facts:[["Тип","Type","Защищённая бухта и риф","Sheltered bay and reef"],["Глубина","Depth","2–13 м","2–13 m"],
         ["Уровень","Level","OW · AOW","OW · AOW"],["Дно","Bottom","Кораллы, песок, камни, стенка","Coral, sand, rocks, a wall"],
         ["GPS","GPS","12.17890 N, 109.29023 E","12.17890 N, 109.29023 E"]],
  life:{ru:["Рыбы-попугаи","Рыбы-бабочки и ангелы","Рыбы-клоуны в анемонах","Мурены","Голожаберные моллюски","Креветки и раки-богомолы","Морские звёзды и ежи","Иногда черепахи и скаты"],
        en:["Parrotfish","Butterflyfish and angelfish","Clownfish in anemones","Moray eels","Nudibranchs","Shrimps and mantis shrimps","Starfish and sea urchins","Turtles and rays, sometimes"]},
  safety:{ru:["Мелководье 2–3 м: камни и прибой у берега","Стенка уходит до 9–13 м","Течение может меняться","Следи за глубиной и плавучестью","Не трогай кораллы и не вставай на риф","Ежи и рыбы-камуфляжи","Лодки у швартовок"],
          en:["2–3 m shallows: rocks and surge by the shore","The wall drops to 9–13 m","The current can change","Watch your depth and buoyancy","Don't touch coral or stand on the reef","Sea urchins and camouflaged fish","Boats at the moorings"]}
 }
];

const MAP_T = {
 ru:{routes:"Маршруты", play:"Показать маршрут", replay:"Ещё раз", depth:"Глубина", time:"Время", best:"Подходит", min:"мин",
     info:"О сайте", life:"Кто живёт", safety:"Безопасность", points:"Точки на карте", want:"Хочу нырнуть здесь",
     current:"течение", hint:"Нажми на точку, чтобы узнать, что там", n:"С", note:"Хочу на сайт"},
 en:{routes:"Routes", play:"Show the route", replay:"Play again", depth:"Depth", time:"Time", best:"Good for", min:"min",
     info:"Site info", life:"Marine life", safety:"Safety", points:"Points on the map", want:"I want to dive here",
     current:"current", hint:"Tap a point to see what's there", n:"N", note:"I'd like to dive"}
};

let mapSite = 0, mapRoute = 0, mapAnim = null, mapAutoplayed = {};

/* Catmull-Rom → cubic Bézier, gives soft natural lines through the given points */
function curve(pts, closed){
  const P = pts.map(p => [p[0], p[1]]), n = P.length;
  if(n < 2) return "";
  const at = i => closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
  let d = `M${P[0][0]},${P[0][1]}`;
  const last = closed ? n : n - 1;
  for(let i = 0; i < last; i++){
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2), k = 6;
    d += `C${(p1[0] + (p2[0] - p0[0]) / k).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / k).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / k).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / k).toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d + (closed ? "Z" : "");
}
/* tiny seeded random so coral patches look the same on every render */
function rng(seed){ let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

const POI_ICON = {
  moor:'<circle r="11" fill="#071a22" stroke="#fff" stroke-width="2.4"/><path d="M-5-5L5 5M5-5L-5 5" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
  boat:'<path d="M-13 2h26l-5 8h-16z" fill="#fff"/><rect x="-6" y="-8" width="11" height="9" rx="1.5" fill="#4fd8f0"/>',
  coral:'<path d="M0 10V-2M0 2l-7-8M0 0l7-9M-7-6l-3-5M7-9l4-3" stroke="#ff7b8a" stroke-width="2.6" fill="none" stroke-linecap="round"/>',
  rock:'<ellipse rx="11" ry="7.5" fill="#8b6a52" stroke="#3b2a1e" stroke-width="1.5"/>',
  tire:'<circle r="9" fill="none" stroke="#1d1d1d" stroke-width="5"/><circle r="9" fill="none" stroke="#555" stroke-width="1"/>',
  nav:'<rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#fff" stroke-dasharray="3 3" stroke-width="1.6"/><g fill="#ff6b5b"><circle cx="-10" cy="-10" r="3"/><circle cx="10" cy="-10" r="3"/><circle cx="-10" cy="10" r="3"/><circle cx="10" cy="10" r="3"/></g>',
  sand:'<g fill="#fff"><circle cx="-5" cy="-3" r="1.6"/><circle cx="2" cy="-5" r="1.6"/><circle cx="6" cy="1" r="1.6"/><circle cx="-2" cy="3" r="1.6"/><circle cx="-7" cy="4" r="1.6"/></g>',
  wall:'<path d="M-11 6l5-11 5 6 5-9 7 14z" fill="#5a6b73" stroke="#c9d6da" stroke-width="1.4" stroke-linejoin="round"/>',
  deep:'<path d="M0-10v18M-6 2l6 7 6-7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  tunnel:'<path d="M-11 8a11 11 0 0 1 22 0" fill="#06131a" stroke="#c9d6da" stroke-width="2.4"/>',
  bike:'<g fill="none" stroke="#fff" stroke-width="2"><circle cx="-7" cy="3" r="5"/><circle cx="8" cy="3" r="5"/><path d="M-7 3l4-8h8l3 8M-3-5l4 8 4-8"/></g>'
};

function mapSVG(S){
  const L = MAP_T[lang], r = rng(S.id.length * 977 + 13);
  // water: deep side darker
  const g = {s:["0","0","0","1"], nw:["1","1","0","0"], sw:["1","0","0","1"]}[S.deep];
  let s = `<defs>
    <linearGradient id="mw" x1="${g[0]}" y1="${g[1]}" x2="${g[2]}" y2="${g[3]}"><stop offset="0" stop-color="#1fa6b4"/><stop offset=".45" stop-color="#0d5f78"/><stop offset="1" stop-color="#062338"/></linearGradient>
    <radialGradient id="mrock" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#d79a63"/><stop offset=".7" stop-color="#9c6440"/><stop offset="1" stop-color="#5b3826"/></radialGradient>
    <linearGradient id="mforest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6b3b"/><stop offset="1" stop-color="#1f4d2d"/></linearGradient>
    <filter id="mblur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
    <filter id="mtex"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="${S.id.length}"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 .95"/><feComposite in2="SourceGraphic" operator="in"/></filter>
    <pattern id="mcaus" width="140" height="140" patternUnits="userSpaceOnUse"><path d="M0 40c30-20 50 20 80 0s50 10 60 0M0 100c20 10 40-20 70 0s50-10 70 5M30 0c-10 30 20 50 0 80s10 40 0 60M100 0c10 30-20 40 0 70s-10 50 5 70" stroke="#bff6ff" stroke-opacity=".07" stroke-width="2" fill="none"/></pattern>
  </defs>
  <rect width="1000" height="625" fill="url(#mw)"/>
  <rect width="1000" height="625" fill="url(#mcaus)" class="m-caus"/>`;
  // shallow halo along every coastline, then the land on top
  const lands = [];
  if(S.shore.length) lands.push(curve(S.shore, true));
  S.islands.forEach(i => lands.push(curve(i, true)));
  s += `<g filter="url(#mblur)" fill="none" stroke-linejoin="round">${lands.map(d => `<path d="${d}" stroke="#5fe0d0" stroke-opacity=".35" stroke-width="150"/><path d="${d}" stroke="#9ff3e3" stroke-opacity=".45" stroke-width="60"/>`).join("")}</g>`;
  S.sand.forEach(([x, y, rr]) => s += `<ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${rr * .55}" fill="#d8ecd0" opacity=".12" filter="url(#mblur)"/>`);
  // coral patches
  let reef = "";
  S.reefs.forEach(([cx, cy, rad, cnt]) => { for(let i = 0; i < cnt * 1.6; i++){
    const a = r() * 6.283, d = Math.sqrt(r()) * rad, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .7, z = 3 + r() * 6;
    const col = ["#2f8f7c","#3a9f8a","#24706a","#2b7b8c","#4a9a78","#b07a86","#a8865e"][Math.min(6, Math.floor(r() * r() * 9))];
    reef += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${z.toFixed(1)}" fill="${col}" stroke="#0a3a40" stroke-opacity=".5" opacity="${(.4 + r() * .35).toFixed(2)}"/>`;
  }});
  s += `<g class="m-reef">${reef}</g>`;
  S.rocks.forEach(([x, y]) => s += `<ellipse cx="${x}" cy="${y}" rx="${9 + r() * 7}" ry="${6 + r() * 4}" fill="#6d5644" stroke="#2f241b" stroke-width="1.2" opacity=".9"/>`);
  // land
  lands.forEach((d, i) => {
    const rock = S.land === "rock";
    s += `<path d="${d}" fill="${rock ? "url(#mrock)" : "url(#mforest)"}" stroke="${rock ? "#3b2416" : "#d9cfa4"}" stroke-width="${rock ? 2 : 5}" stroke-opacity="${rock ? 1 : .8}"/>`;
    s += `<path d="${d}" fill="${rock ? "#5c8f3a" : "#3f8a48"}" filter="url(#mtex)" opacity="${rock ? .55 : .9}"/>`;
  });
  // depth labels
  S.depths.forEach(([x, y, t]) => s += `<text x="${x}" y="${y}" class="m-depth">${esc(t)}</text>`);
  // routes (all dim), the active one drawn bright on top
  S.routes.forEach((R, i) => {
    const d = curve(R.pts, false);
    s += `<g class="m-route${i === mapRoute ? " on" : ""}" data-route="${i}" style="--rc:${R.c}">
      <path d="${d}" class="m-hit"/><path d="${d}" class="m-glow"/><path d="${d}" class="m-line" id="mr-${i}"/>
    </g>`;
  });
  // compass / current
  if(S.north !== null) s += `<g transform="translate(948 62) rotate(${S.north})" class="m-compass"><circle r="30" fill="#061a22" fill-opacity=".72" stroke="#ffffff55"/><path d="M0-22L7 4 0 0-7 4z" fill="#fff"/><path d="M0 22L7 4 0 0-7 4z" fill="#ffffff55"/><text y="-30" class="m-n">${L.n}</text></g>`;
  if(S.current) s += `<g transform="translate(${S.current.x} ${S.current.y})" class="m-current"><path d="M-60 0H40" stroke="#7fd8ff" stroke-width="5" stroke-linecap="round"/><path d="M28-12L50 0 28 12" fill="#7fd8ff"/><text x="-60" y="-14">${L.current}</text></g>`;
  // points of interest
  S.pois.forEach((p, i) => {
    const lx = p.x > 760 ? -18 : 18, anchor = p.x > 760 ? "end" : "start";
    s += `<g class="m-poi" data-poi="${i}" tabindex="0" role="button" aria-label="${esc(p[lang])}, ${esc(p.d)}" transform="translate(${p.x} ${p.y})">
      <circle r="24" class="m-poi-hit"/>${POI_ICON[p.k] || ""}
      <g class="m-tag"><text x="${lx}" y="-12" text-anchor="${anchor}">${esc(p[lang])}<tspan> · ${esc(p.d)}</tspan></text></g>
      <g class="m-num" transform="translate(13 -13)"><circle r="9"/><text y="3.5">${i + 1}</text></g>
    </g>`;
  });
  // the diver
  s += `<g id="m-diver" class="m-diver"><circle r="22" class="m-pulse"/><circle r="9" class="m-dot"/><circle r="3.5" fill="#06131a"/></g>`;
  return s;
}

function renderMaps(){
  const box = $("site-map"); if(!box) return;
  const L = MAP_T[lang], S = SITES[mapSite];
  $("site-tabs").innerHTML = SITES.map((x, i) => `<button type="button" role="tab" aria-selected="${i === mapSite}" tabindex="${i === mapSite ? 0 : -1}" data-site="${i}"><b>${esc(x.name)}</b><small>${esc(x.where[lang])}</small></button>`).join("");
  $("site-svg").innerHTML = mapSVG(S);
  $("site-svg").setAttribute("aria-label", `${S.name}: ${L.routes.toLowerCase()} ${S.routes.map(R => R[lang]).join(", ")}`);
  renderRoutes();
  $("site-pois").innerHTML = S.pois.map((p, i) => `<li><button type="button" data-poi="${i}"><span class="m-pn">${i + 1}</span>${esc(p[lang])} <em>${esc(p.d)}</em></button></li>`).join("");
  $("site-points-h").textContent = L.hint;
  const open = !matchMedia("(max-width:700px)").matches;
  $("site-info").innerHTML = `
    <details${open ? " open" : ""}><summary>${L.info}</summary><dl>${S.facts.map(f => `<div><dt>${esc(lang === "ru" ? f[0] : f[1])}</dt><dd>${esc(lang === "ru" ? f[2] : f[3])}</dd></div>`).join("")}</dl></details>
    <details${open ? " open" : ""}><summary>${L.life}</summary><ul>${S.life[lang].map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>
    <details${open ? " open" : ""}><summary>${L.safety}</summary><ul class="warn">${S.safety[lang].map(x => `<li>${esc(x)}</li>`).join("")}</ul></details>`;
  $("m-play").lastChild.textContent = L.play;
  hidePoiTip();
  placeDiver(0);
}
function renderRoutes(){
  const S = SITES[mapSite], L = MAP_T[lang];
  $("site-routes").innerHTML = `<p class="m-h">${L.routes}</p>` + S.routes.map((R, i) => `
    <div class="m-rt-w${i === mapRoute ? " on" : ""}" style="--rc:${R.c}">
      <button type="button" class="m-rt" data-route="${i}" aria-pressed="${i === mapRoute}">
        <span class="m-sw"></span><span class="m-rt-t"><b>${esc(R[lang])}</b><small>${esc(R.depth)} · ~${R.time} ${L.min} · ${esc(R.best)}</small></span>
      </button>
      ${i === mapRoute ? `<ol class="m-steps">${R["s_" + lang].map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}
    </div>`).join("");
  $("m-route-name").textContent = S.routes[mapRoute][lang];
  $("m-route-name").style.color = S.routes[mapRoute].c;
}
function setRoute(i, play){
  mapRoute = i;
  document.querySelectorAll("#site-svg .m-route").forEach(g => g.classList.toggle("on", +g.dataset.route === i));
  renderRoutes(); stopDiver(); placeDiver(0);
  if(play) playDiver();
}
/* depth along the route: interpolate the depths of the control points by distance */
function depthAt(R, t){
  const P = R.pts; let total = 0; const seg = [];
  for(let i = 1; i < P.length; i++){ const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(d); total += d; }
  let want = t * total;
  for(let i = 0; i < seg.length; i++){
    if(want <= seg[i] || i === seg.length - 1){ const k = seg[i] ? Math.min(1, want / seg[i]) : 0; return P[i][2] + (P[i + 1][2] - P[i][2]) * k; }
    want -= seg[i];
  }
  return P[0][2];
}
function placeDiver(t){
  const path = $("mr-" + mapRoute), dv = $("m-diver"); if(!path || !dv) return;
  const R = SITES[mapSite].routes[mapRoute], len = path.getTotalLength(), pt = path.getPointAtLength(len * t);
  dv.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
  dv.style.setProperty("--rc", R.c);
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len * (1 - (t || 1))}`;
  $("m-depth").textContent = depthAt(R, t).toFixed(1);
  // on phones the map is wider than the screen: keep the diver in view
  const sc = $("m-scroll");
  if(sc && sc.scrollWidth > sc.clientWidth + 2){
    const k = sc.scrollWidth / 1000;
    sc.scrollLeft = Math.max(0, Math.min(sc.scrollWidth - sc.clientWidth, pt.x * k - sc.clientWidth / 2));
  }
  $("m-time").textContent = Math.round(R.time * t);
}
function stopDiver(){ if(mapAnim){ cancelAnimationFrame(mapAnim); mapAnim = null; } $("site-map").classList.remove("playing"); }
function playDiver(){
  stopDiver();
  if(matchMedia("(prefers-reduced-motion: reduce)").matches){ placeDiver(1); return; }
  const R = SITES[mapSite].routes[mapRoute], dur = 7000 + R.pts.length * 250; let t0 = 0;
  const path = $("mr-" + mapRoute); if(path){ const len = path.getTotalLength(); path.style.strokeDashoffset = `${len}`; }
  $("site-map").classList.add("playing");
  const step = now => {
    if(!t0) t0 = now;
    const t = Math.min(1, (now - t0) / dur), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    placeDiver(Math.max(e, .0001));
    if(t < 1) mapAnim = requestAnimationFrame(step);
    else { mapAnim = null; $("site-map").classList.remove("playing"); $("m-play").lastChild.textContent = MAP_T[lang].replay; }
  };
  mapAnim = requestAnimationFrame(step);
}

/* point-of-interest tooltip, positioned in the map box */
function showPoiTip(i){
  const S = SITES[mapSite], p = S.pois[i], tip = $("m-tip"), box = $("site-map");
  tip.innerHTML = `<b>${esc(p[lang])}</b><span class="mono">${esc(p.d)}</span><p>${esc(p["n_" + lang])}</p>`;
  tip.hidden = false;
  const sc = $("m-scroll");
  if(sc && sc.scrollWidth > sc.clientWidth + 2) sc.scrollLeft = Math.max(0, p.x / 1000 * sc.scrollWidth - sc.clientWidth / 2);
  const svg = $("site-svg").getBoundingClientRect(), bb = box.getBoundingClientRect();
  const x = svg.left - bb.left + p.x / 1000 * svg.width, y = svg.top - bb.top + p.y / 625 * svg.height;
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let left = Math.max(8, Math.min(bb.width - w - 8, x - w / 2)), top = y - h - 22;
  if(top < 8) top = y + 26;
  tip.style.left = left + "px"; tip.style.top = top + "px";
  document.querySelectorAll("#site-svg .m-poi").forEach(g => g.classList.toggle("hot", +g.dataset.poi === i));
  document.querySelectorAll("#site-pois [data-poi]").forEach(b => b.classList.toggle("hot", +b.dataset.poi === i));
}
function hidePoiTip(){
  const t = $("m-tip"); if(t) t.hidden = true;
  document.querySelectorAll(".m-poi.hot, #site-pois .hot").forEach(g => g.classList.remove("hot"));
}

(function wireMaps(){
  if(!$("site-map")) return;
  $("site-tabs").addEventListener("click", e => {
    const b = e.target.closest("[data-site]"); if(!b) return;
    mapSite = +b.dataset.site; mapRoute = 0; stopDiver(); renderMaps(); playDiver();
  });
  $("site-tabs").addEventListener("keydown", e => {
    if(e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault(); mapSite = (mapSite + (e.key === "ArrowRight" ? 1 : -1) + SITES.length) % SITES.length; mapRoute = 0;
    stopDiver(); renderMaps(); $("site-tabs").querySelector(`[data-site="${mapSite}"]`).focus();
  });
  $("site-routes").addEventListener("click", e => { const b = e.target.closest("[data-route]"); if(b) setRoute(+b.dataset.route, true); });
  $("m-play").addEventListener("click", playDiver);
  $("site-svg").addEventListener("click", e => {
    const p = e.target.closest(".m-poi"); if(p){ showPoiTip(+p.dataset.poi); return; }
    const r = e.target.closest(".m-route"); if(r){ setRoute(+r.dataset.route, true); return; }
    hidePoiTip();
  });
  $("site-svg").addEventListener("keydown", e => {
    const p = e.target.closest(".m-poi"); if(p && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); showPoiTip(+p.dataset.poi); }
  });
  $("site-svg").addEventListener("pointerover", e => { const p = e.target.closest(".m-poi"); if(p && e.pointerType === "mouse") showPoiTip(+p.dataset.poi); });
  $("site-svg").addEventListener("pointerout", e => { const p = e.target.closest(".m-poi"); if(p && e.pointerType === "mouse" && !p.contains(e.relatedTarget)) hidePoiTip(); });
  $("site-pois").addEventListener("click", e => { const b = e.target.closest("[data-poi]"); if(b) showPoiTip(+b.dataset.poi); });
  document.addEventListener("click", e => { if(!e.target.closest("#site-map") && !e.target.closest("#site-pois")) hidePoiTip(); });
  addEventListener("resize", hidePoiTip);
  // swim the first route once when the map scrolls into view
  if("IntersectionObserver" in window){
    const io = new IntersectionObserver(es => es.forEach(en => {
      if(en.isIntersecting && !mapAutoplayed[mapSite]){ mapAutoplayed[mapSite] = 1; playDiver(); }
    }), {threshold:.45});
    io.observe($("site-map"));
  }
})();
