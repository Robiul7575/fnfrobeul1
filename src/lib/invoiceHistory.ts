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
let creds: { username: string; password: string } | null = null;

const CREDS_KEY = 'fnf-history-creds';
try {
  const raw = localStorage.getItem(CREDS_KEY);
  if (raw) creds = JSON.parse(raw);
} catch {}

export function setHistoryCredentials(username: string, password: string) {
  creds = { username, password };
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}
export function clearHistoryCredentials() {
  creds = null;
  localStorage.removeItem(CREDS_KEY);
}

export function getSavedInvoices(): SavedInvoice[] {
  return cache;
}

export async function fetchSavedInvoices(): Promise<SavedInvoice[]> {
  if (!creds) return cache;
  const { data, error } = await supabase.functions.invoke('history-admin', {
    body: { op: 'list', ...creds },
  });
  if (error) {
    console.error('fetchSavedInvoices', error);
    return cache;
  }
  const rows = (data as any)?.data as Row[] | undefined;
  if (!rows) return cache;
  cache = rows.map(rowToInvoice);
  window.dispatchEvent(new CustomEvent(EVENT));
  return cache;
}

export async function saveInvoice(invoice: Omit<SavedInvoice, 'savedAt'>): Promise<void> {
  const { error } = await supabase.functions.invoke('save-invoice', {
    body: invoice,
  });
  if (error) console.error('saveInvoice', error);
  if (creds) await fetchSavedInvoices();
}

export async function removeInvoice(invoiceNumber: string, action: SavedInvoice['action']): Promise<void> {
  if (!creds) return;
  const { error } = await supabase.functions.invoke('history-admin', {
    body: { op: 'delete', invoiceNumber, action, ...creds },
  });
  if (error) console.error('removeInvoice', error);
  await fetchSavedInvoices();
}

export async function clearInvoiceHistory(): Promise<void> {
  if (!creds) return;
  const { error } = await supabase.functions.invoke('history-admin', {
    body: { op: 'clear', ...creds },
  });
  if (error) console.error('clearInvoiceHistory', error);
  await fetchSavedInvoices();
}

export function subscribeInvoiceHistory(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  // initial fetch (only works if creds are set)
  fetchSavedInvoices();
  // poll every 20s while subscribed so multiple devices stay roughly in sync
  const interval = window.setInterval(() => fetchSavedInvoices(), 20_000);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.clearInterval(interval);
  };
}
