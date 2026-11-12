// Register by invite. Public sign-ups are disabled in Supabase Auth, so this is the only way in.
// The role comes from the invite row on the server; anything the browser sends about roles is ignored.
import { admin, allowRate, cors, json, originAllowed, str, turnstileOk } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req) });
  if (req.method !== "POST" || !originAllowed(req)) return json(req, { error: "forbidden" }, 403);
  if (!(await allowRate(req, "invite", 10, 3600))) return json(req, { error: "too_many" }, 429);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json(req, { error: "bad_json" }, 400); }
  if (!(await turnstileOk(b.captcha, req))) return json(req, { error: "captcha" }, 400);

  let token: string, email: string;
  try {
    token = str(b.token, 64, 20)!;
    email = str(b.email, 254, 5)!.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw 0;
  } catch { return json(req, { error: "invalid" }, 400); }

  // 1) atomically claim the invite (one use, not expired, not revoked)
  const { data: claim, error: cErr } = await admin.rpc("claim_invite", { p_token: token });
  if (cErr || !claim?.length) return json(req, { error: "invite_invalid" }, 400); // same answer for every failure
  const inviteId = claim[0].invite_id as string;

  // 2) create the account by e-mail link: proves the address is real; the password is set from the link
  const { data: u, error: uErr } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: (Deno.env.get("SITE_URL") ?? "") + "/join/",
  });
  if (uErr || !u?.user) {
    await admin.rpc("release_invite", { p_invite: inviteId });
    return json(req, { error: "signup_failed" }, 400);
  }

  // 3) bind invite to the user and grant the invite's role
  const { error: fErr } = await admin.rpc("finish_invite", { p_invite: inviteId, p_user: u.user.id });
  if (fErr) {
    await admin.auth.admin.deleteUser(u.user.id);
    await admin.rpc("release_invite", { p_invite: inviteId });
    return json(req, { error: "signup_failed" }, 500);
  }
  return json(req, { ok: true, check_email: true });
});
