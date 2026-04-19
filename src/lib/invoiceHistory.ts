export interface SavedInvoice {
  invoiceNumber: string;
  chemistName: string;
  chemistCode: string;
  total: number;
  itemCount: number;
  paymentMode: 'Cash' | 'Credit';
  action: 'downloaded' | 'printed';
  savedAt: number;
}

const STORAGE_KEY = 'fnf-invoice-history';
const MAX_INVOICES = 100;

export function getSavedInvoices(): SavedInvoice[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const list: SavedInvoice[] = data ? JSON.parse(data) : [];
    return list.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

export function saveInvoice(invoice: Omit<SavedInvoice, 'savedAt'>): void {
  const list = getSavedInvoices();
  const entry: SavedInvoice = { ...invoice, savedAt: Date.now() };
  // dedupe by invoiceNumber+action — update if exists
  const idx = list.findIndex(
    (i) => i.invoiceNumber === entry.invoiceNumber && i.action === entry.action
  );
  if (idx >= 0) {
    list[idx] = entry;
  } else {
    list.unshift(entry);
  }
  const trimmed = list.slice(0, MAX_INVOICES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  window.dispatchEvent(new CustomEvent('fnf-invoice-history-updated'));
}

export function removeInvoice(invoiceNumber: string, action: SavedInvoice['action']): void {
  const list = getSavedInvoices().filter(
    (i) => !(i.invoiceNumber === invoiceNumber && i.action === action)
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('fnf-invoice-history-updated'));
}

export function clearInvoiceHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('fnf-invoice-history-updated'));
}
