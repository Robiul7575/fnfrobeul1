import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Printer, Download } from 'lucide-react';
import { useRef } from 'react';
import { InvoiceInfo } from './InvoiceInfoDialog';
import { InvoicePreview } from './InvoicePreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceInfo: InvoiceInfo;
}

export function InvoiceModal({ open, onOpenChange, invoiceInfo }: InvoiceModalProps) {
  const { items, getTotals, discountPercent, getItemTp } = useCart();
  const totals = getTotals();
  const printRef = useRef<HTMLDivElement>(null);

  const invoiceNumber = `CUM${Date.now().toString().slice(-8)}`;
  
  const now = new Date();
  const invoiceDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  
  const orderDate = invoiceDate;
  
  const printDateTime = now.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
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
            body { font-family: Arial, sans-serif; padding: 10mm; font-size: 11px; line-height: 1.3; }
            
            /* Layout utilities */
            .flex { display: flex; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .gap-2 { gap: 0.5rem; }
            .gap-x-8 { column-gap: 2rem; }
            
            /* Spacing */
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-8 { margin-top: 2rem; }
            .mt-10 { margin-top: 2.5rem; }
            .pt-1 { padding-top: 0.25rem; }
            .pt-2 { padding-top: 0.5rem; }
            .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
            
            /* Widths */
            .w-10 { width: 2.5rem; }
            .h-10 { height: 2.5rem; }
            .h-\\[80px\\] { height: 80px; }
            .w-auto { width: auto; }
            .object-contain { object-fit: contain; }
            .gap-3 { gap: 0.75rem; }
            .w-24 { width: 6rem; display: inline-block; }
            .w-28 { width: 7rem; }
            .w-full { width: 100%; }
            .min-w-\\[180px\\] { min-width: 180px; }
            .max-w-\\[50\\%\\] { max-width: 50%; }
            
            /* Logo print styles - keep colorful for header and watermark */
            .relative { position: relative; }
            .absolute { position: absolute; }
            .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
            .pointer-events-none { pointer-events: none; }
            .w-\\[400px\\] { width: 400px; }
            .h-\\[45px\\] { height: 45px; }
            
            /* Text */
            .text-\\[9px\\] { font-size: 9px; }
            .text-\\[10px\\] { font-size: 10px; }
            .text-\\[11px\\] { font-size: 11px; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-left { text-align: left; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .leading-tight { line-height: 1.25; }
            
            /* Borders */
            .border { border: 1px solid #000; }
            .border-2 { border: 2px solid #000; }
            .border-t { border-top: 1px solid #000; }
            .border-b { border-bottom: 1px solid #000; }
            .border-t-2 { border-top: 2px solid #000; }
            .border-black { border-color: #000; }
            .border-dashed { border-style: dashed; }
            .border-dotted { border-style: dotted; }
            .border-gray-400 { border-color: #9ca3af; }
            .border-blue-600 { border-color: #2563eb; }
            .rounded-full { border-radius: 9999px; }
            
            /* Colors */
            .text-blue-600 { color: #2563eb; }
            .bg-white { background-color: white; }
            .text-black { color: black; }
            
            /* Table */
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 3px 4px; }
            
            /* Spacing helpers */
            .space-y-0\\.5 > * + * { margin-top: 0.125rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            
            /* Print specific */
            @media print { 
              body { 
                print-color-adjust: exact; 
                -webkit-print-color-adjust: exact;
              }
              @page { 
                margin: 10mm;
                size: A4;
              }
            }
            
            /* Inline block for proper rendering */
            .inline-block { display: inline-block; }
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

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Invoice-${invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
          orderDate={orderDate}
          printDateTime={printDateTime}
          totals={totals}
          discountPercent={discountPercent}
          getItemTp={getItemTp}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
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
