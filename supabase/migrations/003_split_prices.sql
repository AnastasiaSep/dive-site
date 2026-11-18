-- Separate price lines (Rainbow Divers booklet, Nov 2026): fun dives 1/3, beach night dive, EFR.
insert into public.programs (id, grp, sort, price_usd, price_from, recommended, name_ru, name_en, desc_ru, desc_en) values
 ('fun1','cert',5,55,false,false,'Fun dive: 1 погружение','Fun dive: 1 dive','Одно погружение с гидом у островов.','One guided dive around the islands.'),
 ('fun3','cert',15,100,false,false,'Fun dives: 3 погружения','Fun dives: 3 dives','Три погружения за день, если позволяет расписание лодки.','Three dives in a day when the boat schedule allows.'),
 ('nightb','cert',25,50,false,false,'Ночное погружение с пляжа','Night dive from the beach','Ночное погружение с берега.','A night dive from the shore.'),
 ('efr','courses',45,150,false,false,'EFR — первая помощь','EFR — first aid','Курс первой помощи Emergency First Response.','The Emergency First Response first-aid course.')
on conflict (id) do nothing;
update public.programs set name_ru='Ночное погружение с лодки', name_en='Night dive from the boat', desc_ru='Выход с лодки вечером, нужно минимум 2 дайвера.', desc_en='An evening boat dive, minimum 2 divers.' where id='night';
update public.programs set desc_ru='Два погружения на разных сайтах за один выход в море.', desc_en='Two dives at two sites on one trip.' where id='fun2';
update public.programs set desc_ru='Сначала занятие в бассейне, потом два погружения в море.', desc_en='A pool session first, then two dives at sea.' where id='dsd135';
