// Public settings. Safe to publish: the anon key only allows what row-level security allows.
// Leave SUPABASE_URL empty and the site works as a plain page (WhatsApp/Telegram only).
window.SITE_CONFIG = {
  SUPABASE_URL: "",          // e.g. "https://abcd1234.supabase.co"
  SUPABASE_ANON_KEY: "",     // Project Settings → API → anon public
  TURNSTILE_SITEKEY: "",     // Cloudflare → Turnstile → site key
};
