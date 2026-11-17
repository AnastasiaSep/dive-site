# Dive Nha Trang with Nastya — сайт, база, админка

## Бесплатно на GitHub Pages (ничего не покупать)

Settings → Pages → Source: **GitHub Actions**. Через минуту сайт будет на
**https://anastasiasep.github.io/dive-site/** и будет обновляться сам после каждого изменения в репозитории.
Без базы работает всё, кроме приёма заявок на сайте и админки: клиенты пишут в WhatsApp/Telegram.
Админка и инвайты включаются бесплатно: шаги 2–6 ниже (Supabase и капча Cloudflare тоже бесплатные, домен не нужен —
вместо «твой-домен» везде пиши `https://anastasiasep.github.io/dive-site`, а в ALLOWED_ORIGINS — `https://anastasiasep.github.io`).

Этапы 3–5 из аудита. Код готов и проверен, осталось развернуть на твоих аккаунтах (бесплатно, кроме домена ~$10 в год).

## Что внутри

```
src/                    исходник лендинга — правки делать тут:
  page.html             разметка и стили
  app.js                цены, контакты, подбор программы (QUIZ), сезон, форма
  maps.js               интерактивные карты дайв-сайтов (SITES: маршруты, точки, тексты RU/EN)
  intro.js              3D-анимация погружения при загрузке (WebGL, без библиотек)
  backend.js            заявки и аналитика через Supabase (по желанию)
public/vendor/air-datepicker-3.5.3.*   календарь дат в форме (Air Datepicker, MIT, из npm; тема в page.html)
tools/build.py          собирает src/ → public/ (команда: python3 tools/build.py)
public/                 сайт (кладётся на Cloudflare Pages как есть)
  index.html, app.js    лендинг; без настроек работает как сейчас (WhatsApp/Telegram)
  config.js             3 публичных ключа, заполнить один раз
  admin/                админка: дашборд, заявки, цены, инвайты, пользователи, журнал
  join/                 регистрация по инвайту
  _headers              защитные заголовки (CSP, HSTS, запрет встраивания)
supabase/migrations/    таблицы, роли, правила доступа (RLS), цены
supabase/functions/     серверный код: заявки, аналитика, инвайты
tests/run_local.sh      проверка прав на локальной базе (40 атак, все блокируются)
tests/live_check.sh     та же проверка на настоящем сайте после запуска
```

## Как устроена безопасность (коротко)

- Роль (админ / гид / клиент) хранится в таблице `user_roles`. Писать в неё через сайт не может никто, даже админ. Поле «role» в запросе, подделанный токен, правка JS в браузере ничего не дают: база проверяет сама.
- Админ = роль `admin` в таблице **и** вход с кодом из приложения (2FA). Без кода даже твой аккаунт ничего не видит.
- Админа нельзя выдать инвайтом. Только руками в SQL (шаг 3).
- Инвайт: в базе лежит только хэш, ссылка показывается один раз, 7 дней, одно использование, можно отозвать. Регистрация без инвайта выключена.
- Заявки и аналитика пишутся только через серверные функции: капча Cloudflare, лимит по IP, проверка длины каждого поля.
- Журнал действий нельзя изменить или удалить. Каждое изменение цены или заявки пишется туда автоматически.
- Аналитика без cookies и IP: только «сколько зашли, что нажали, сколько написали».

## Запуск: шаги по порядку

**1. Домен.** Купи в Cloudflare Registrar (Domains → Register). Например `nastyadives.com`.

**2. База (Supabase).** supabase.com → New project, регион Singapore.
- SQL Editor → вставь и запусти `supabase/migrations/001_init.sql`, потом `002_seed_programs.sql`.
- Authentication → Sign In / Providers → Email: **выключи «Allow new users to sign up»**, минимальная длина пароля 12.
- Authentication → URL Configuration: Site URL `https://твой-домен`, Redirect URLs `https://твой-домен/join/`.
- Authentication → Multi-Factor: TOTP включён (по умолчанию).

**3. Твой админ-аккаунт.** Authentication → Users → Add user → e-mail + длинный пароль, Auto Confirm. Потом в SQL Editor:
```sql
insert into public.user_roles(user_id, role)
select id, 'admin' from auth.users where email = 'твой@email';
```
Это единственный способ сделать админа.

**4. Капча.** Cloudflare → Turnstile → Add site → домен. Скопируй Site key и Secret key.

**5. Серверные функции.** На компьютере (нужен Node):
```bash
npx supabase login
npx supabase link --project-ref <ref из адреса проекта>
npx supabase secrets set ALLOWED_ORIGINS=https://твой-домен SITE_URL=https://твой-домен \
  TURNSTILE_SECRET=<secret> RATE_SALT=$(openssl rand -hex 16)
# по желанию: уведомления о заявках в Telegram от твоего бота
npx supabase secrets set TG_BOT_TOKEN=<токен бота> TG_CHAT_ID=<твой chat id>
npx supabase functions deploy submit-lead track redeem-invite
```

**6. config.js.** Впиши `SUPABASE_URL`, `SUPABASE_ANON_KEY` (Project Settings → API → anon public) и `TURNSTILE_SITEKEY`. Эти ключи публичные, так и задумано.

**7. Хостинг.** Cloudflare → Workers & Pages → Create → Pages → Upload assets → папка `public`. Потом Custom domains → твой домен. По желанию: Web Analytics (вкл. одной кнопкой).

**8. Проверка.**
```bash
./tests/live_check.sh https://твой-домен https://<ref>.supabase.co <anon key>
```
Все строки должны быть `OK`. Потом открой `/admin/`, войди, отсканируй QR в Google Authenticator / 2FAS.

## Как пользоваться админкой

- **Дашборд**: посетители, клики «написать», заявки, конверсия, доля телефонов и русского, какие программы выбирают.
- **Заявки**: статус (new → contacted → booked → done), депозит, ссылка на оплату, заметка.
- **Контент**: цены, названия, описания, «Советую», скрыть/показать. На сайте меняется сразу.
- **Инвайты**: роль гид или клиент, заметка «для кого» → ссылка. Отправь лично.
- **Пользователи**: кто зарегистрирован, убрать роль.
- **Журнал**: кто что менял.

## Оплата (этапы 21–22)

Депозиты сейчас работают вручную: в заявке ставишь сумму и вставляешь ссылку на оплату (PayPal.me, Wise и т.п.), отправляешь клиенту, после оплаты ставишь «paid». Автоматическую оплату подключу, когда выберешь сервис. Платный гайд по дайв-сайтам появится, когда будет текст: роли «клиент» и инвайты для закрытого раздела уже есть.

## Локальная проверка прав

Нужен Postgres 16: `tests/run_local.sh` поднимает временную базу, применяет миграции и пробует ~40 атак (аноним, обычный пользователь, поддельные claims, админ без 2FA, повтор инвайта и т.д.).
