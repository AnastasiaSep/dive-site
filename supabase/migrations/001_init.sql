-- Dive Nha Trang: schema, roles and row-level security.
-- Principle: the browser is never trusted. Roles live in a table that no client
-- role can write; every admin check runs in the database via is_admin().

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- roles
create table public.user_roles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('admin','guide','client')),
  created_at timestamptz not null default now()
);
alter table public.user_roles enable row level security;

-- is_admin(): role in the table AND a 2FA session (aal2).
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'aal') = 'aal2', false)
     and exists (select 1 from public.user_roles r
                 where r.user_id = auth.uid() and r.role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- a signed-in user may read their own role; nobody can write through the API
create policy user_roles_read_own on public.user_roles
  for select to authenticated using (user_id = auth.uid());
create policy user_roles_admin_read on public.user_roles
  for select to authenticated using (public.is_admin());
revoke insert, update, delete, truncate on public.user_roles from anon, authenticated;

-- ---------------------------------------------------------------- audit log (append-only)
create table public.audit_log (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  actor      uuid,
  action     text not null,
  target     text,
  details    jsonb not null default '{}'::jsonb
);
alter table public.audit_log enable row level security;
create policy audit_admin_read on public.audit_log
  for select to authenticated using (public.is_admin());
revoke insert, update, delete, truncate on public.audit_log from anon, authenticated;

create or replace function public.audit(p_action text, p_target text, p_details jsonb)
returns void language sql security definer set search_path = '' as $$
  insert into public.audit_log(actor, action, target, details)
  values (auth.uid(), p_action, p_target, coalesce(p_details, '{}'::jsonb));
$$;
revoke all on function public.audit(text,text,jsonb) from public, anon, authenticated;

-- ---------------------------------------------------------------- invites
create table public.invites (
  id          uuid primary key default gen_random_uuid(),
  token_hash  text not null unique,           -- sha256 hex of the token; the token itself is never stored
  role        text not null check (role in ('guide','client')),  -- admin is never granted by invite
  note        text check (char_length(note) <= 200),
  created_by  uuid not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '7 days',
  used_at     timestamptz,
  used_by     uuid,
  revoked_at  timestamptz
);
alter table public.invites enable row level security;
create policy invites_admin_read on public.invites
  for select to authenticated using (public.is_admin());
revoke insert, update, delete, truncate on public.invites from anon, authenticated;

-- admin creates an invite; the plain token is returned once and only its hash is kept
create or replace function public.create_invite(p_role text, p_note text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare v_token text; v_id uuid;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_role not in ('guide','client') then raise exception 'bad role'; end if;
  v_token := translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/=', '-_');
  insert into public.invites(token_hash, role, note, created_by)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), p_role, left(p_note, 200), auth.uid())
  returning id into v_id;
  perform public.audit('invite.create', v_id::text, jsonb_build_object('role', p_role));
  return v_token;
end $$;
revoke all on function public.create_invite(text,text) from public, anon;
grant execute on function public.create_invite(text,text) to authenticated;

create or replace function public.revoke_invite(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.invites set revoked_at = now() where id = p_id and used_at is null and revoked_at is null;
  perform public.audit('invite.revoke', p_id::text, '{}');
end $$;
revoke all on function public.revoke_invite(uuid) from public, anon;
grant execute on function public.revoke_invite(uuid) to authenticated;

-- called only by the redeem-invite edge function (service role).
-- Atomic: a token can be claimed once, even by parallel requests.
create or replace function public.claim_invite(p_token text)
returns table(invite_id uuid, role text) language plpgsql security definer set search_path = '' as $$
begin
  return query
  update public.invites i set used_at = now()
   where i.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
     and i.used_at is null and i.revoked_at is null and i.expires_at > now()
  returning i.id, i.role;
end $$;
revoke all on function public.claim_invite(text) from public, anon, authenticated;

create or replace function public.finish_invite(p_invite uuid, p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  update public.invites set used_by = p_user where id = p_invite and used_by is null returning role into v_role;
  if v_role is null then raise exception 'invite not claimed'; end if;
  insert into public.user_roles(user_id, role) values (p_user, v_role);
  insert into public.audit_log(actor, action, target, details)
  values (p_user, 'invite.redeem', p_invite::text, jsonb_build_object('role', v_role));
end $$;
revoke all on function public.finish_invite(uuid,uuid) from public, anon, authenticated;

-- undo a claim if account creation failed
create or replace function public.release_invite(p_invite uuid)
returns void language sql security definer set search_path = '' as $$
  update public.invites set used_at = null where id = p_invite and used_by is null;
$$;
revoke all on function public.release_invite(uuid) from public, anon, authenticated;

-- admin can remove a guide/client role, never touch another admin, never grant admin
create or replace function public.remove_role(p_user uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  delete from public.user_roles where user_id = p_user and role <> 'admin';
  perform public.audit('role.remove', p_user::text, '{}');
end $$;
revoke all on function public.remove_role(uuid) from public, anon;
grant execute on function public.remove_role(uuid) to authenticated;

-- ---------------------------------------------------------------- programs (site content)
create table public.programs (
  id          text primary key check (id ~ '^[a-z0-9_-]{2,40}$'),
  grp         text not null check (grp in ('first','courses','cert','snork','extra')),
  sort        int  not null default 100,
  price_usd   int  not null check (price_usd between 0 and 100000),
  price_from  boolean not null default false,
  recommended boolean not null default false,
  active      boolean not null default true,
  name_ru     text not null check (char_length(name_ru) between 1 and 120),
  name_en     text not null check (char_length(name_en) between 1 and 120),
  desc_ru     text not null default '' check (char_length(desc_ru) <= 600),
  desc_en     text not null default '' check (char_length(desc_en) <= 600),
  updated_at  timestamptz not null default now()
);
alter table public.programs enable row level security;
create policy programs_public_read on public.programs
  for select to anon, authenticated using (active);
create policy programs_admin_read on public.programs
  for select to authenticated using (public.is_admin());
create policy programs_admin_write on public.programs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------- leads (booking requests)
create table public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null check (char_length(name) between 1 and 80),
  contact        text not null check (char_length(contact) between 3 and 80),
  program_id     text references public.programs(id) on delete set null,
  people         int  not null default 1 check (people between 1 and 20),
  date_from      date,
  date_to        date check (date_to is null or date_from is null or date_to >= date_from),
  hotel          text check (char_length(hotel) <= 120),
  wants_media    boolean not null default false,
  note           text check (char_length(note) <= 1000),
  lang           text not null default 'en' check (lang in ('ru','en')),
  status         text not null default 'new' check (status in ('new','contacted','booked','done','cancelled','spam')),
  deposit_usd    int check (deposit_usd between 0 and 10000),
  deposit_status text not null default 'none' check (deposit_status in ('none','requested','paid','refunded')),
  payment_link   text check (payment_link is null or payment_link ~ '^https://'),
  admin_note     text check (char_length(admin_note) <= 2000)
);
alter table public.leads enable row level security;
-- no anon/insert policy: leads arrive only through the submit-lead edge function
create policy leads_admin_read on public.leads
  for select to authenticated using (public.is_admin());
create policy leads_admin_update on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
revoke insert, delete, truncate on public.leads from anon, authenticated;

-- ---------------------------------------------------------------- analytics (no IP, no personal data)
create table public.page_events (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  session    text not null check (session ~ '^[a-zA-Z0-9]{8,32}$'),
  event      text not null check (event in ('view','path','tab','term','pick','wa','tg','copy','lead','lang')),
  value      text check (char_length(value) <= 40),
  lang       text check (lang in ('ru','en')),
  device     text check (device in ('mobile','desktop'))
);
create index on public.page_events (at);
alter table public.page_events enable row level security;
create policy events_admin_read on public.page_events
  for select to authenticated using (public.is_admin());
revoke insert, update, delete, truncate on public.page_events from anon, authenticated;

-- ---------------------------------------------------------------- rate limiting for edge functions
create table public.rate_limits (
  key          text primary key,
  window_start timestamptz not null,
  hits         int not null
);
alter table public.rate_limits enable row level security;   -- no policies: service role only

create or replace function public.hit_rate(p_key text, p_max int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_hits int;
begin
  insert into public.rate_limits as r(key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;
  return v_hits <= p_max;
end $$;
revoke all on function public.hit_rate(text,int,int) from public, anon, authenticated;

-- ---------------------------------------------------------------- audit triggers on admin edits
create or replace function public.trg_audit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log(actor, action, target, details)
  values (auth.uid(), tg_table_name || '.' || lower(tg_op),
          coalesce((case when tg_op = 'DELETE' then old.id else new.id end)::text, ''),
          case when tg_op = 'UPDATE' then jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new))
               when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end);
  return coalesce(new, old);
end $$;
create trigger programs_audit after insert or update or delete on public.programs
  for each row execute function public.trg_audit();
create trigger leads_audit after update on public.leads
  for each row execute function public.trg_audit();

-- ---------------------------------------------------------------- dashboard view for admins
create or replace function public.dashboard(p_days int default 30)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v jsonb; d int := least(greatest(p_days, 1), 365);
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select jsonb_build_object(
    'visitors', (select count(distinct session) from public.page_events where event='view' and at > now() - make_interval(days => d)),
    'wa_clicks', (select count(*) from public.page_events where event in ('wa','tg','copy') and at > now() - make_interval(days => d)),
    'leads', (select count(*) from public.leads where created_at > now() - make_interval(days => d)),
    'booked', (select count(*) from public.leads where status in ('booked','done') and created_at > now() - make_interval(days => d)),
    'mobile_share', (select round(100.0 * count(*) filter (where device='mobile') / nullif(count(*),0)) from public.page_events where event='view' and at > now() - make_interval(days => d)),
    'ru_share', (select round(100.0 * count(*) filter (where lang='ru') / nullif(count(*),0)) from public.page_events where event='view' and at > now() - make_interval(days => d)),
    'by_day', (select coalesce(jsonb_agg(x order by x->>'day'), '[]'::jsonb) from (
        select jsonb_build_object('day', to_char(date_trunc('day', at), 'YYYY-MM-DD'),
               'visitors', count(distinct session) filter (where event='view'),
               'contacts', count(*) filter (where event in ('wa','tg','copy','lead'))) x
          from public.page_events where at > now() - make_interval(days => d) group by date_trunc('day', at)) s),
    'top_programs', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('id', value, 'picks', count(*)) x from public.page_events
         where event='pick' and at > now() - make_interval(days => d)
         group by value order by count(*) desc limit 8) s),
    'paths', (select coalesce(jsonb_object_agg(value, n), '{}'::jsonb) from (
        select value, count(*) n from public.page_events where event='path' and at > now() - make_interval(days => d) group by value) s)
  ) into v;
  return v;
end $$;
revoke all on function public.dashboard(int) from public, anon;
grant execute on function public.dashboard(int) to authenticated;
