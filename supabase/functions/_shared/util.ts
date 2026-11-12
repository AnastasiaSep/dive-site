// Shared helpers for edge functions. Runs on the server with the service role key,
// which never reaches the browser.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(s => s.trim()).filter(Boolean);

export function cors(req: Request): Record<string, string> {
  const o = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ORIGINS.includes(o) ? o : (ORIGINS[0] ?? "null"),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Vary": "Origin",
  };
}

export function originAllowed(req: Request): boolean {
  return ORIGINS.includes(req.headers.get("origin") ?? "");
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors(req), "content-type": "application/json", "cache-control": "no-store" },
  });
}

export const admin = createClient(
  Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export function clientIp(req: Request): string {
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

// hash the IP so the rate-limit table never stores raw addresses
export async function ipKey(req: Request, scope: string): Promise<string> {
  const salt = Deno.env.get("RATE_SALT") ?? "";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + clientIp(req)));
  return scope + ":" + Array.from(new Uint8Array(buf)).slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function allowRate(req: Request, scope: string, max: number, windowSec: number): Promise<boolean> {
  const { data, error } = await admin.rpc("hit_rate", { p_key: await ipKey(req, scope), p_max: max, p_window_seconds: windowSec });
  return !error && data === true;
}

export async function turnstileOk(token: unknown, req: Request): Promise<boolean> {
  if (typeof token !== "string" || token.length > 2048) return false;
  const form = new FormData();
  form.append("secret", Deno.env.get("TURNSTILE_SECRET")!);
  form.append("response", token);
  form.append("remoteip", clientIp(req));
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
  const j = await r.json().catch(() => ({}));
  return j.success === true;
}

export function str(v: unknown, max: number, min = 0): string | null {
  if (v === undefined || v === null || v === "") return min === 0 ? null : (() => { throw new Error("missing"); })();
  if (typeof v !== "string") throw new Error("bad type");
  const s = v.trim();
  if (s.length < min || s.length > max) throw new Error("bad length");
  return s || null;
}
