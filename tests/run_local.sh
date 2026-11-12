#!/usr/bin/env bash
# Local RLS test: throwaway Postgres 16 + Supabase auth stub + migrations + tests.
set -euo pipefail
BIN=${PGBIN:-/usr/lib/postgresql/16/bin}; D=$(mktemp -d); HERE=$(cd "$(dirname "$0")" && pwd)
"$BIN/initdb" -D "$D" -U postgres -A trust >/dev/null
"$BIN/pg_ctl" -D "$D" -o "-k $D -p 54329 -c listen_addresses=''" -l "$D/log" start >/dev/null
trap '"$BIN/pg_ctl" -D "$D" stop -m fast >/dev/null; rm -rf "$D"' EXIT
P="psql -h $D -p 54329 -U postgres -v ON_ERROR_STOP=1 -q"
$P -f "$HERE/supabase_stub.sql"
for f in "$HERE"/../supabase/migrations/*.sql; do $P -f "$f"; done
$P -o /dev/null -f "$HERE/rls_test.sql" 2>&1 | sed "s/^psql:[^ ]* NOTICE:  //"
