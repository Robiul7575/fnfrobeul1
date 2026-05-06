import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InvoicePreview } from './InvoicePreview';
import type { SavedInvoice } from '@/lib/invoiceHistory';
import type { CartItem } from '@/context/CartContext';

interface Props {
  invoice: SavedInvoice | null;
  onOpenChange: (open: boolean) => void;
}

export function SavedInvoicePreviewDialog({ invoice, onOpenChange }: Props) {
  const open = !!invoice;
  const snap = invoice?.snapshot;

  const getItemTp = (item: CartItem) =>
    item.customTp !== undefined ? item.customTp : item.product.tp;

  const totals = (() => {
    if (!snap) return { subtotal: 0, vat: 0, total: 0 };
    const subtotal = snap.items.reduce((s, i) => s + getItemTp(i) * i.quantity, 0);
    const vat = snap.items.reduce((s, i) => s + i.product.vat * i.quantity, 0);
    return { subtotal, vat, total: subtotal + vat };
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">
            Saved Invoice — {invoice?.invoiceNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-auto flex-1">
          {snap ? (
            <div style={{ width: '210mm', transformOrigin: 'top left' }} className="scale-[0.42] sm:scale-[0.65] md:scale-75 lg:scale-100">
              <InvoicePreview
                items={snap.items}
                invoiceInfo={snap.invoiceInfo}
                invoiceNumber={invoice!.invoiceNumber}
                invoiceDate={snap.invoiceDate}
                orderDate={snap.orderDate}
                printDateTime={snap.printDateTime}
                totals={totals}
                discountPercent={snap.discountPercent}
                getItemTp={getItemTp}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No snapshot available for this invoice (saved before preview support).
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}