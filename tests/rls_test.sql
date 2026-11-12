-- Run after migrations. Every "expect fail" block must raise; the script stops at the first surprise.
\set ON_ERROR_STOP 1
insert into auth.users values ('00000000-0000-0000-0000-00000000000a','admin@x'),('00000000-0000-0000-0000-00000000000b','user@x'),('00000000-0000-0000-0000-00000000000c','new@x');
insert into public.user_roles values ('00000000-0000-0000-0000-00000000000a','admin',now()),('00000000-0000-0000-0000-00000000000b','client',now());

create function pg_temp.as_user(p_sub text, p_aal text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claims', json_build_object('sub',p_sub,'aal',p_aal,'role','authenticated')::text, false); end $$;

create function pg_temp.must_fail(p_sql text, p_label text) returns void language plpgsql as $$
declare n int;
begin
  begin execute p_sql; get diagnostics n = row_count;
  exception when others then raise notice 'OK   blocked: % (%)', p_label, sqlerrm; return; end;
  if n = 0 then raise notice 'OK   no rows affected: %', p_label; return; end if;
  raise exception 'FAIL allowed: %', p_label;
end $$;
create function pg_temp.count_is(p_sql text, p_expect int, p_label text) returns void language plpgsql as $$
declare n int; begin execute p_sql into n;
  if n <> p_expect then raise exception 'FAIL %: got %, expected %', p_label, n, p_expect; end if;
  raise notice 'OK   %: %', p_label, n; end $$;
grant execute on all functions in schema pg_temp to anon, authenticated;

-- ===== anonymous visitor
set role anon;
select pg_temp.count_is('select count(*) from public.programs', 16, 'anon sees active programs');
select pg_temp.count_is('select count(*) from public.user_roles', 0, 'anon sees no roles');
select pg_temp.count_is('select count(*) from public.leads', 0, 'anon sees no leads');
select pg_temp.must_fail($$insert into public.leads(name,contact) values ('x','xxx')$$, 'anon insert lead directly');
select pg_temp.must_fail($$insert into public.user_roles values (gen_random_uuid(),'admin',now())$$, 'anon insert role');
select pg_temp.must_fail($$select public.create_invite('client')$$, 'anon create invite');
select pg_temp.must_fail($$select * from public.claim_invite('x')$$, 'anon claim invite');
select pg_temp.must_fail($$update public.programs set price_usd=1$$, 'anon edit prices');
select pg_temp.must_fail($$insert into public.page_events(session,event) values ('abcdefgh','view')$$, 'anon write analytics directly');
reset role;

-- ===== ordinary signed-in client tries to escalate
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b','aal2');
set role authenticated;
select pg_temp.count_is('select count(*) from public.user_roles', 1, 'client sees only own role');
select pg_temp.must_fail($$update public.user_roles set role='admin' where user_id=auth.uid()$$, 'client promotes self');
select pg_temp.must_fail($$insert into public.user_roles values (gen_random_uuid(),'admin',now())$$, 'client inserts admin role');
select pg_temp.must_fail($$delete from public.user_roles$$, 'client deletes roles');
select pg_temp.must_fail($$select public.create_invite('guide')$$, 'client creates invite');
select pg_temp.must_fail($$select public.remove_role('00000000-0000-0000-0000-00000000000a')$$, 'client removes admin');
select pg_temp.must_fail($$select public.dashboard(30)$$, 'client opens dashboard');
select pg_temp.must_fail($$select public.finish_invite(gen_random_uuid(), auth.uid())$$, 'client finishes invite');
select pg_temp.must_fail($$select public.hit_rate('x',1,1)$$, 'client calls rate limiter');
select pg_temp.must_fail($$insert into public.audit_log(action) values ('fake')$$, 'client forges audit');
select pg_temp.must_fail($$update public.programs set price_usd=1$$, 'client edits prices');
select pg_temp.count_is('select count(*) from public.leads', 0, 'client sees no leads');
reset role;

-- forged JWT claim "role":"admin" changes nothing: the role comes from the table
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b","aal":"aal2","role":"authenticated","app_role":"admin","user_role":"admin"}', false);
set role authenticated;
select pg_temp.must_fail($$select public.dashboard(30)$$, 'client with forged claims');
reset role;

-- ===== admin without 2FA (aal1) is not admin
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a','aal1');
set role authenticated;
select pg_temp.must_fail($$select public.create_invite('client')$$, 'admin without 2FA creates invite');
select pg_temp.count_is('select count(*) from public.leads', 0, 'admin without 2FA sees no leads');
reset role;

-- ===== admin with 2FA
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a','aal2');
set role authenticated;
select pg_temp.must_fail($$select public.create_invite('admin')$$, 'admin issues ADMIN invite');
create temp table tok as select public.create_invite('guide','test') t;
grant select on tok to service_role;
select pg_temp.count_is('select count(*) from public.invites', 1, 'admin sees invites');
select pg_temp.count_is($$select count(*) from public.invites where token_hash = (select t from tok)$$, 0, 'plain token not stored');
update public.programs set price_usd = 99 where id='dsd95';
select pg_temp.count_is($$select count(*) from public.audit_log where action='programs.update'$$, 1, 'price edit audited');
select pg_temp.must_fail($$delete from public.audit_log$$, 'admin deletes audit log');
select pg_temp.must_fail($$update public.audit_log set action='x'$$, 'admin rewrites audit log');
select public.remove_role('00000000-0000-0000-0000-00000000000a');
select pg_temp.count_is($$select count(*) from public.user_roles where role='admin'$$, 1, 'admin still admin');
select (public.dashboard(30) ? 'visitors') as dashboard_ok;
reset role;

-- ===== invite redemption (service role, as the edge function does)
set role service_role;
select pg_temp.count_is($$select count(*) from public.claim_invite((select t from tok))$$, 1, 'first claim');
select pg_temp.count_is($$select count(*) from public.claim_invite((select t from tok))$$, 0, 'second claim of same token');
select public.finish_invite((select id from public.invites limit 1), '00000000-0000-0000-0000-00000000000c');
select pg_temp.count_is($$select count(*) from public.user_roles where user_id='00000000-0000-0000-0000-00000000000c' and role='guide'$$, 1, 'new user got guide role');
select pg_temp.must_fail($$select public.finish_invite((select id from public.invites limit 1), '00000000-0000-0000-0000-00000000000b')$$, 'reuse finished invite');
select pg_temp.count_is($$select count(*) from public.claim_invite('wrong-token')$$, 0, 'wrong token');
update public.invites set used_at=null, used_by=null, expires_at = now() - interval '1 second';
select pg_temp.count_is($$select count(*) from public.claim_invite((select t from tok))$$, 0, 'expired token');
select pg_temp.count_is($$select public.hit_rate('ip:1',2,60)::int$$, 1, 'rate 1');
select pg_temp.count_is($$select public.hit_rate('ip:1',2,60)::int$$, 1, 'rate 2');
select pg_temp.count_is($$select public.hit_rate('ip:1',2,60)::int$$, 0, 'rate 3 blocked');
reset role;
\o
\echo ALL RLS TESTS PASSED
