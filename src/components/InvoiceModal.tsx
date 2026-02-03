import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { InvoiceInfo } from './InvoiceInfoDialog';
import { InvoicePreview } from './InvoicePreview';

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceInfo: InvoiceInfo;
}

export function InvoiceModal({ open, onOpenChange, invoiceInfo }: InvoiceModalProps) {
  const { items, getTotals } = useCart();
  const totals = getTotals();
  const printRef = useRef<HTMLDivElement>(null);

  const invoiceNumber = `CUM${Date.now().toString().slice(-8)}`;
  const invoiceDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 15px; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .border { border: 1px solid #000; }
            .border-t { border-top: 1px solid #000; }
            .border-b-2 { border-bottom: 2px solid #000; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .col-span-2 { grid-column: span 2; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .gap-x-8 { column-gap: 2rem; }
            .gap-y-1 { row-gap: 0.25rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-8 { margin-top: 2rem; }
            .p-3 { padding: 0.75rem; }
            .pb-4 { padding-bottom: 1rem; }
            .pt-1 { padding-top: 0.25rem; }
            .pt-4 { padding-top: 1rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .w-24 { width: 6rem; display: inline-block; }
            .w-32 { width: 8rem; }
            .min-w-48 { min-width: 12rem; }
            .text-xs { font-size: 10px; }
            .text-lg { font-size: 14px; }
            .text-2xl { font-size: 18px; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .italic { font-style: italic; }
            @media print { 
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              @page { margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
        </DialogHeader>

        <InvoicePreview
          ref={printRef}
          items={items}
          invoiceInfo={invoiceInfo}
          invoiceNumber={invoiceNumber}
          invoiceDate={invoiceDate}
          totals={totals}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
