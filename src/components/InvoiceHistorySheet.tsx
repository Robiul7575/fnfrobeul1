import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { History, Trash2, Download, Printer } from 'lucide-react';
import {
  getSavedInvoices,
  removeInvoice,
  clearInvoiceHistory,
  SavedInvoice,
} from '@/lib/invoiceHistory';

export function InvoiceHistorySheet() {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = () => setInvoices(getSavedInvoices());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('fnf-invoice-history-updated', handler);
    return () => window.removeEventListener('fnf-invoice-history-updated', handler);
  }, []);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <History className="h-4 w-4 mr-1" />
          History
          {invoices.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground rounded-full h-5 min-w-5 px-1">
              {invoices.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Invoice History</SheetTitle>
        </SheetHeader>

        <div className="flex justify-between items-center mt-4 mb-2">
          <p className="text-xs text-muted-foreground">
            {invoices.length} saved invoice{invoices.length === 1 ? '' : 's'}
          </p>
          {invoices.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Clear all invoice history?')) clearInvoiceHistory();
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-auto -mx-2 px-2">
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No invoices saved yet.
              <br />
              Generate & download/print an invoice to see it here.
            </div>
          ) : (
            <ul className="space-y-2">
              {invoices.map((inv) => (
                <li
                  key={`${inv.invoiceNumber}-${inv.action}-${inv.savedAt}`}
                  className="border rounded-md p-3 bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-primary">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                            inv.action === 'downloaded'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {inv.action === 'downloaded' ? (
                            <Download className="h-2.5 w-2.5" />
                          ) : (
                            <Printer className="h-2.5 w-2.5" />
                          )}
                          {inv.action}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{inv.chemistName || '—'}</p>
                      {inv.chemistCode && (
                        <p className="text-xs text-muted-foreground truncate">
                          Code: {inv.chemistCode}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{inv.itemCount} items</span>
                        <span className="font-semibold text-foreground">
                          ৳{inv.total.toFixed(2)}
                        </span>
                        <span>{inv.paymentMode}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDate(inv.savedAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => removeInvoice(inv.invoiceNumber, inv.action)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
