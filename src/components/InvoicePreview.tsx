import { forwardRef } from 'react';
import { CartItem } from '@/context/CartContext';
import { InvoiceInfo } from './InvoiceInfoDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InvoicePreviewProps {
  items: CartItem[];
  invoiceInfo: InvoiceInfo;
  invoiceNumber: string;
  invoiceDate: string;
  totals: { subtotal: number; vat: number; total: number };
}

function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  const intPart = Math.floor(num);
  
  if (intPart < 1000) return convertLessThanThousand(intPart);
  if (intPart < 100000) {
    const thousands = Math.floor(intPart / 1000);
    const remainder = intPart % 1000;
    return convertLessThanThousand(thousands) + ' Thousand' + (remainder ? ' ' + convertLessThanThousand(remainder) : '');
  }
  if (intPart < 10000000) {
    const lakhs = Math.floor(intPart / 100000);
    const remainder = intPart % 100000;
    return convertLessThanThousand(lakhs) + ' Lakh' + (remainder ? ' ' + numberToWords(remainder) : '');
  }
  const crores = Math.floor(intPart / 10000000);
  const remainder = intPart % 10000000;
  return convertLessThanThousand(crores) + ' Crore' + (remainder ? ' ' + numberToWords(remainder) : '');
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ items, invoiceInfo, invoiceNumber, invoiceDate, totals }, ref) => {
    const { subtotal, vat, total } = totals;
    const discount = subtotal * 0.02; // 2% discount
    const netPayable = total - discount;

    return (
      <div ref={ref} className="bg-white text-black p-6 text-sm">
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-4">
          <div className="flex justify-between items-start">
            <div className="text-xs">
              <p>Corporate Office: Urban Stream Commercial Complex Level # 03,</p>
              <p>18 New Eskaton (R.K. Menon Road) Dhaka-1000. Phone: 9336001</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-xs">1 of 1</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="font-bold text-lg">F n F Pharmaceuticals Ltd.</p>
            <p className="text-xs">Factory: Rautail, Nagarbathan, Jhenaidah, Bangladesh. Phone: 0451-63297</p>
          </div>
        </div>

        {/* MUSHAK Info */}
        <div className="text-center mb-4">
          <p className="font-semibold">FnF Pharmaceuticals Ltd. MUSHAK-6.3</p>
          <p className="text-xs">[Clauses (c) and (f) of sub-Rule (1) of Rule 40]</p>
        </div>

        {/* Invoice Details Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4 text-xs border p-3">
          <div className="flex">
            <span className="font-semibold w-24">Depot:</span>
            <span>CUMILLA</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Contact No:</span>
            <span>{invoiceInfo.contactNo}</span>
          </div>
          
          <div className="flex">
            <span className="font-semibold w-24">Chemist Name:</span>
            <span>{invoiceInfo.chemistName}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Invoice No:</span>
            <span>{invoiceNumber}</span>
          </div>
          
          <div className="flex">
            <span className="font-semibold w-24">Chemist Code:</span>
            <span>{invoiceInfo.chemistCode}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Invoice Date:</span>
            <span>{invoiceDate}</span>
          </div>
          
          <div className="flex">
            <span className="font-semibold w-24">Address:</span>
            <span>{invoiceInfo.address}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Order Date:</span>
            <span>{invoiceDate}</span>
          </div>
          
          <div className="flex">
            <span className="font-semibold w-24">Market:</span>
            <span>{invoiceInfo.market}</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-24">Payment Mode:</span>
            <span>Cash</span>
          </div>
          
          <div className="flex col-span-2">
            <span className="font-semibold w-24">Field Force:</span>
            <span>{invoiceInfo.fieldForce}</span>
          </div>
        </div>

        {/* Products Table */}
        <Table className="border text-xs">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="border text-black font-bold py-1">Products Name</TableHead>
              <TableHead className="border text-black font-bold py-1">Pack Size</TableHead>
              <TableHead className="border text-black font-bold py-1 text-right">Qty</TableHead>
              <TableHead className="border text-black font-bold py-1 text-right">Unit TP</TableHead>
              <TableHead className="border text-black font-bold py-1 text-right">Unit VAT</TableHead>
              <TableHead className="border text-black font-bold py-1 text-right">TP+VAT</TableHead>
              <TableHead className="border text-black font-bold py-1 text-right">Bonus</TableHead>
              <TableHead className="border text-black font-bold py-1 text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.product.id}>
                <TableCell className="border py-1">{item.product.name}</TableCell>
                <TableCell className="border py-1">{item.product.packSize}</TableCell>
                <TableCell className="border py-1 text-right">{item.quantity}</TableCell>
                <TableCell className="border py-1 text-right">{item.product.tp.toFixed(2)}</TableCell>
                <TableCell className="border py-1 text-right">{item.product.vat.toFixed(2)}</TableCell>
                <TableCell className="border py-1 text-right">{item.product.tp_vat.toFixed(2)}</TableCell>
                <TableCell className="border py-1 text-right">{item.product.bonus || 0}</TableCell>
                <TableCell className="border py-1 text-right font-medium">
                  {(item.product.tp_vat * item.quantity).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Totals */}
        <div className="mt-4 flex justify-between">
          <div className="text-xs italic">
            In Words: {numberToWords(Math.round(netPayable))} Taka Only
          </div>
          <div className="text-xs space-y-1 min-w-48">
            <div className="flex justify-between">
              <span>Gross TP:</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Line Item Discount:</span>
              <span>- 0.00</span>
            </div>
            <div className="flex justify-between">
              <span>SubTotal + Group Discount:</span>
              <span>- {discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gross TP(After Discount):</span>
              <span>{(subtotal - discount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Add VAT on TP:</span>
              <span>{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Net Payable:</span>
              <span>{netPayable.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t">
          <div className="flex justify-between text-xs">
            <div className="text-center">
              <div className="border-t border-black w-32 pt-1 mt-8">Chemist's Signature</div>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-32 pt-1 mt-8">Checked By</div>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-32 pt-1 mt-8">Authorized Signature</div>
            </div>
          </div>
          <p className="text-center text-xs mt-4">For FnF Pharmaceuticals Ltd.</p>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
