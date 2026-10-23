/* Checks a Flip It Out Pro license key (Cloudflare Pages Function, served at /api/verify).
   The owner key (OWNER_KEY) always passes. Other keys are validated with the Lemon Squeezy license API
   and must belong to this store and product (LS_STORE_ID, LS_PRODUCT_ID). */
export async function onRequestPost({ request, env }) {
  let key = "";
  try { key = String((await request.json()).key || "").trim(); } catch (e) { /* empty body */ }
  if (!key || key.length > 200) return reply({ ok: false, error: "Enter a license key." }, 400);

  if (env.OWNER_KEY && same(key, env.OWNER_KEY)) return reply({ ok: true, owner: true });

  let data = {};
  try {
    const res = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ license_key: key })
    });
    data = await res.json();
  } catch (e) {
    return reply({ ok: false, error: "The license server could not be reached. Try again in a minute." }, 502);
  }
  const meta = data.meta || {};
  const ours = (!env.LS_STORE_ID || String(meta.store_id) === String(env.LS_STORE_ID)) &&
    (!env.LS_PRODUCT_ID || String(meta.product_id) === String(env.LS_PRODUCT_ID));
  if (data.valid === true && ours) return reply({ ok: true, owner: false });
  return reply({ ok: false, error: "This license key is not valid, or it has expired." }, 403);
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
