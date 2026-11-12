-- Rainbow Divers price list, October 2026 (USD). Edit later from /admin → Контент.
insert into public.programs (id, grp, sort, price_usd, price_from, recommended, name_ru, name_en, desc_ru, desc_en) values
 ('dsd95','first',10,95,false,true,'Пробное погружение','Discover Scuba','Онлайн-теория, инструктаж и два погружения с инструктором. Сертификат не нужен.','Online theory, a briefing and two boat dives with an instructor. No certificate needed.'),
 ('dsd135','first',20,135,false,false,'Пробное + бассейн','Discover Scuba + pool','То же, но сначала занятие в бассейне. Лучший вариант, если волнуешься.','Same, with a pool session first. Best if you''re nervous.'),
 ('dsd65','first',30,65,false,false,'1 погружение + снорклинг','1 try dive + snorkelling','Попробовать один раз и поплавать с маской.','One try dive plus snorkelling.'),
 ('bubble','first',40,60,false,false,'Bubblemaker, дети 8–9','Bubblemaker, kids 8–9','Первое знакомство с аквалангом для детей.','A first taste of scuba for kids.'),
 ('ow','courses',10,450,false,true,'Open Water','Open Water','Первый сертификат дайвера, до 18 м. $150 онлайн-теория PADI + $300 бассейн и море. Страховка DAN в подарок.','Your first dive licence, to 18 m. $150 PADI eLearning + $300 pool and ocean training. Free DAN insurance.'),
 ('aow','courses',20,495,false,false,'Advanced + Nitrox','Advanced + Nitrox','Следующий уровень плюс специализация на найтроксе.','The next level plus the Nitrox specialty.'),
 ('owaow','courses',30,795,false,false,'Open Water + Advanced + Nitrox','Open Water + Advanced + Nitrox','С нуля до Advanced за одну поездку. На $150 дешевле, чем по отдельности.','From zero to Advanced in one trip, $150 less than booking separately.'),
 ('rescue','courses',40,350,false,false,'Rescue Diver','Rescue Diver','EFR (первая помощь) $150. Добавить Nitrox $175, Deco Chamber $150.','EFR first aid $150. Add Nitrox $175, Deco Chamber $150.'),
 ('pack','courses',50,1000,false,false,'Пакет: Advanced + Nitrox + Rescue + EFR + Deco Chamber','Bundle: Advanced + Nitrox + Rescue + EFR + Deco Chamber','Самый выгодный путь к Rescue.','The best-value route to Rescue.'),
 ('spec','courses',60,125,true,false,'Специализации','Specialties','Deep, Nitrox, Night, навигация, плавучесть и другие.','Deep, Nitrox, Night, Navigation, Buoyancy and more.'),
 ('fun2','cert',10,80,false,true,'Fun dives: 2 погружения','Fun dives: 2 dives','1 погружение $55, 3 погружения $100 (по расписанию).','1 dive $55, 3 dives $100 (subject to schedule).'),
 ('night','cert',20,75,false,false,'Ночное погружение','Night dive','С пляжа $50.','From the beach $50.'),
 ('refresh','cert',30,50,false,false,'Рефрешер','Refresher','Если давно не нырял(а). Проходит в рамках первого погружения, онлайн-теория +$50.','If you haven''t dived in a while. Done as part of your first dive; online theory +$50.'),
 ('speed','cert',40,75,false,false,'Частный катер (за чел. в день)','Private speedboat (per person/day)','2–4 человека, дальние сайты: The Wall 42 м, Ray Plateau 30 м, The Freefall 40 м.','2–4 people, remote sites: The Wall 42 m, Ray Plateau 30 m, The Freefall 40 m.'),
 ('snork40','snork',10,40,false,false,'Снорклинг / пассажир','Snorkelling / passenger','День на лодке для друзей и семьи. Дети до 5 лет бесплатно.','A day on the boat for friends and family. Under-5s free.'),
 ('snork50','snork',20,50,false,false,'Снорклинг PADI с гидом','PADI snorkelling with guide','Можно добавить пробное погружение всего за $30.','Add a try dive for just $30.')
on conflict (id) do nothing;
