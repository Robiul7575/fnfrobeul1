import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const {
      invoiceNumber, action, chemistName, chemistCode,
      total, itemCount, paymentMode, snapshot,
    } = body ?? {};

    if (typeof invoiceNumber !== 'string' || invoiceNumber.length === 0 || invoiceNumber.length > 64) {
      return new Response(JSON.stringify({ error: 'invalid invoiceNumber' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (action !== 'downloaded' && action !== 'printed') {
      return new Response(JSON.stringify({ error: 'invalid action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      invoice_number: invoiceNumber,
      action,
      chemist_name: typeof chemistName === 'string' ? chemistName.slice(0, 255) : null,
      chemist_code: typeof chemistCode === 'string' ? chemistCode.slice(0, 64) : null,
      total: Number(total) || 0,
      item_count: Number(itemCount) || 0,
      payment_mode: paymentMode === 'Credit' ? 'Credit' : 'Cash',
      snapshot: snapshot ?? null,
      saved_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('invoices')
      .upsert(payload, { onConflict: 'invoice_number,action' });

    if (error) {
      console.error('save-invoice error', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});