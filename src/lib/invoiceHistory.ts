import type { CartItem } from '@/context/CartContext';
import type { InvoiceInfo } from '@/components/InvoiceInfoDialog';
import { supabase } from '@/integrations/supabase/client';

export interface InvoiceSnapshot {
  items: CartItem[];
  invoiceInfo: InvoiceInfo;
  invoiceDate: string;
  orderDate: string;
  printDateTime: string;
  discountPercent: number;
}

export interface SavedInvoice {
  invoiceNumber: string;
  chemistName: string;
  chemistCode: string;
  total: number;
  itemCount: number;
  paymentMode: 'Cash' | 'Credit';
  action: 'downloaded' | 'printed';
  savedAt: number;
  snapshot?: InvoiceSnapshot;
}

const EVENT = 'fnf-invoice-history-updated';

type Row = {
  invoice_number: string;
  action: string;
  chemist_name: string | null;
  chemist_code: string | null;
  total: number | string;
  item_count: number;
  payment_mode: string | null;
  snapshot: any;
  saved_at: string;
};

const rowToInvoice = (r: Row): SavedInvoice => ({
  invoiceNumber: r.invoice_number,
  action: r.action as SavedInvoice['action'],
  chemistName: r.chemist_name ?? '',
  chemistCode: r.chemist_code ?? '',
  total: Number(r.total),
  itemCount: r.item_count,
  paymentMode: (r.payment_mode as SavedInvoice['paymentMode']) ?? 'Cash',
  snapshot: r.snapshot ?? undefined,
  savedAt: new Date(r.saved_at).getTime(),
});

let cache: SavedInvoice[] = [];

export function getSavedInvoices(): SavedInvoice[] {
  return cache;
}

export async function fetchSavedInvoices(): Promise<SavedInvoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('saved_at', { ascending: false })
    .limit(500);
  if (error) {
    console.error('fetchSavedInvoices', error);
    return cache;
  }
  cache = (data as Row[]).map(rowToInvoice);
  window.dispatchEvent(new CustomEvent(EVENT));
  return cache;
}

export async function saveInvoice(invoice: Omit<SavedInvoice, 'savedAt'>): Promise<void> {
  const payload = {
    invoice_number: invoice.invoiceNumber,
    action: invoice.action,
    chemist_name: invoice.chemistName,
    chemist_code: invoice.chemistCode,
    total: invoice.total,
    item_count: invoice.itemCount,
    payment_mode: invoice.paymentMode,
    snapshot: (invoice.snapshot ?? null) as any,
    saved_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('invoices')
    .upsert(payload, { onConflict: 'invoice_number,action' });
  if (error) console.error('saveInvoice', error);
  await fetchSavedInvoices();
}

export async function removeInvoice(invoiceNumber: string, action: SavedInvoice['action']): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('invoice_number', invoiceNumber)
    .eq('action', action);
  if (error) console.error('removeInvoice', error);
  await fetchSavedInvoices();
}

export async function clearInvoiceHistory(): Promise<void> {
  const { error } = await supabase.from('invoices').delete().neq('invoice_number', '');
  if (error) console.error('clearInvoiceHistory', error);
  await fetchSavedInvoices();
}

export function subscribeInvoiceHistory(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  const channel = supabase
    .channel('invoices-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
      fetchSavedInvoices();
    })
    .subscribe();
  // initial fetch
  fetchSavedInvoices();
  return () => {
    window.removeEventListener(EVENT, handler);
    supabase.removeChannel(channel);
  };
}
