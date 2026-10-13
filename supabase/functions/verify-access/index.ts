import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const ADMIN_PASS = Deno.env.get('HISTORY_PASS') ?? 'Robeul1';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { code } = await req.json().catch(() => ({}));
    if (typeof code !== 'string' || !code.trim() || code.length > 100) return json({ ok: false });
    const c = code.trim();
    // Admin password always grants access.
    if (c === ADMIN_PASS) return json({ ok: true, expiresAt: null });
    const { data } = await supabase
      .from('access_codes')
      .select('expires_at')
      .eq('code', c)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (!data) return json({ ok: false });
    return json({ ok: true, expiresAt: data.expires_at });
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500);
  }
});
