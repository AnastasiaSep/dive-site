#!/usr/bin/env bash
# Run against the REAL deployment after every change:  ./tests/live_check.sh https://your-domain https://xxxx.supabase.co ANON_KEY
# Every line must say OK. It tries what an attacker with the public anon key would try.
SITE=$1; SB=$2; KEY=$3; fail=0
H=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json")
ok(){ echo "OK   $1"; }; bad(){ echo "FAIL $1"; fail=1; }
code(){ curl -s -o /dev/null -w '%{http_code}' "$@"; }

[ "$(curl -s "${H[@]}" "$SB/rest/v1/leads?select=*")" = "[]" ] && ok "anon cannot read leads" || bad "anon can read leads"
[ "$(curl -s "${H[@]}" "$SB/rest/v1/user_roles?select=*")" = "[]" ] && ok "anon cannot read roles" || bad "anon can read roles"
[ "$(curl -s "${H[@]}" "$SB/rest/v1/invites?select=*")" = "[]" ] && ok "anon cannot read invites" || bad "anon can read invites"
c=$(code "${H[@]}" -X POST "$SB/rest/v1/user_roles" -d '{"user_id":"00000000-0000-0000-0000-000000000000","role":"admin"}'); [[ $c =~ ^(401|403)$ ]] && ok "anon cannot grant admin ($c)" || bad "grant admin returned $c"
c=$(code "${H[@]}" -X POST "$SB/rest/v1/leads" -d '{"name":"x","contact":"xxx"}'); [[ $c =~ ^(401|403)$ ]] && ok "anon cannot write leads directly ($c)" || bad "direct lead insert returned $c"
c=$(code "${H[@]}" -X PATCH "$SB/rest/v1/programs?id=eq.dsd95" -d '{"price_usd":1}'); body=$(curl -s "${H[@]}" "$SB/rest/v1/programs?id=eq.dsd95&select=price_usd"); [[ $body != *'"price_usd":1}'* ]] && ok "anon cannot change prices" || bad "anon changed a price!"
c=$(code "${H[@]}" -X POST "$SB/rest/v1/rpc/create_invite" -d '{"p_role":"guide"}'); [[ $c =~ ^(400|401|403|404)$ ]] && ok "anon cannot create invites ($c)" || bad "create_invite returned $c"
c=$(code "${H[@]}" -X POST "$SB/rest/v1/rpc/claim_invite" -d '{"p_token":"x"}'); [[ $c =~ ^(401|403|404)$ ]] && ok "anon cannot call claim_invite ($c)" || bad "claim_invite returned $c"
c=$(code "${H[@]}" -X POST "$SB/rest/v1/rpc/dashboard" -d '{}'); [[ $c =~ ^(400|401|403)$ ]] && ok "anon cannot open dashboard ($c)" || bad "dashboard returned $c"
c=$(code "${H[@]}" -X POST "$SB/auth/v1/signup" -d '{"email":"probe'$RANDOM'@example.com","password":"Probe-123456789"}'); [[ $c =~ ^(400|403|422)$ ]] && ok "public sign-up disabled ($c)" || bad "public sign-up is OPEN ($c)"
c=$(code "${H[@]}" -X POST "$SB/functions/v1/submit-lead" -H "Origin: https://evil.example" -d '{}'); [ "$c" = 403 ] && ok "foreign origin rejected" || bad "submit-lead from foreign origin returned $c"
hdr=$(curl -sI "$SITE/"); for h in content-security-policy strict-transport-security x-frame-options; do grep -qi "^$h:" <<<"$hdr" && ok "header $h" || bad "missing header $h"; done
c=$(code "$SITE/admin/"); [ "$c" = 200 ] && ok "admin page served (protection is on the server, not the URL)"
exit $fail
