import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const VALID_USER = Deno.env.get('HISTORY_USER') ?? 'Robeul';
const VALID_PASS = Deno.env.get('HISTORY_PASS') ?? 'Robeul1';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { op, username, password, invoiceNumber, action } = body ?? {};
    if (username !== VALID_USER || password !== VALID_PASS) {
      return json({ error: 'unauthorized' }, 401);
    }

    if (op === 'list') {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('saved_at', { ascending: false })
        .limit(500);
      if (error) return json({ error: error.message }, 500);
      return json({ data });
    }

    if (op === 'delete') {
      if (typeof invoiceNumber !== 'string' || (action !== 'downloaded' && action !== 'printed')) {
        return json({ error: 'invalid params' }, 400);
      }
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('invoice_number', invoiceNumber)
        .eq('action', action);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (op === 'clear') {
      const { error } = await supabase.from('invoices').delete().neq('invoice_number', '');
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: 'unknown op' }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});