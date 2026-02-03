import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Printer, Download } from 'lucide-react';
import { useState, useRef } from 'react';

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceModal({ open, onOpenChange }: InvoiceModalProps) {
  const { items, getTotals } = useCart();
  const { subtotal, vat, total } = getTotals();
  const printRef = useRef<HTMLDivElement>(null);

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    phone: '',
  });

  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
  const invoiceDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
            .header { text-align: center; margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .totals { text-align: right; margin-top: 20px; }
            .total-row { font-weight: bold; font-size: 1.2em; }
            @media print { body { print-color-adjust: exact; } }
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
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>

        {/* Customer Info Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerInfo.name}
              onChange={(e) =>
                setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <Label htmlFor="customerAddress">Address</Label>
            <Input
              id="customerAddress"
              value={customerInfo.address}
              onChange={(e) =>
                setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))
              }
              placeholder="Enter address"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone</Label>
            <Input
              id="customerPhone"
              value={customerInfo.phone}
              onChange={(e) =>
                setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Invoice Preview */}
        <div ref={printRef} className="border rounded-lg p-6 bg-white">
          <div className="header text-center mb-6">
            <h1 className="text-2xl font-bold text-primary">FnF Pharmaceuticals</h1>
            <p className="text-muted-foreground">Veterinary Products</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p>{customerInfo.name || 'Customer Name'}</p>
              <p className="text-sm text-muted-foreground">
                {customerInfo.address || 'Address'}
              </p>
              <p className="text-sm text-muted-foreground">
                {customerInfo.phone || 'Phone'}
              </p>
            </div>
            <div className="text-right">
              <p>
                <span className="font-semibold">Invoice #:</span> {invoiceNumber}
              </p>
              <p>
                <span className="font-semibold">Date:</span> {invoiceDate}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Pack Size</TableHead>
                <TableHead className="text-right">TP</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">VAT</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.product.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell>{item.product.packSize}</TableCell>
                  <TableCell className="text-right">
                    ৳{item.product.tp.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    ৳{(item.product.vat * item.quantity).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ৳{(item.product.tp_vat * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="text-right">
                  Subtotal (TP)
                </TableCell>
                <TableCell className="text-right">৳{subtotal.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={6} className="text-right">
                  Total VAT
                </TableCell>
                <TableCell className="text-right">৳{vat.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow className="font-bold text-lg">
                <TableCell colSpan={6} className="text-right">
                  Grand Total (TP+VAT)
                </TableCell>
                <TableCell className="text-right">৳{total.toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>Thank you for your business!</p>
            <p>FnF Pharmaceuticals - Quality Veterinary Products</p>
          </div>
        </div>

        {/* Action Buttons */}
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
