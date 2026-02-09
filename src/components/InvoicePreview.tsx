import { forwardRef } from 'react';
import { CartItem } from '@/context/CartContext';
import { InvoiceInfo } from './InvoiceInfoDialog';
import fnfLogo from '@/assets/fnf-logo.svg';
import fnfLogoColor from '@/assets/fnf-logo-color.svg';

interface InvoicePreviewProps {
  items: CartItem[];
  invoiceInfo: InvoiceInfo;
  invoiceNumber: string;
  invoiceDate: string;
  orderDate: string;
  printDateTime: string;
  totals: { subtotal: number; vat: number; total: number };
  discountPercent: number;
  getItemTp: (item: CartItem) => number;
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

// Parse bonus string like "8+1", "10+1", "5+1, 20+5" and calculate bonus qty
function calculateBonus(bonusStr: string, quantity: number): number {
  if (!bonusStr || bonusStr === 'N/A') return 0;
  
  // Handle flat rate bonuses like "100 (Flat Rate)"
  if (bonusStr.includes('Flat Rate')) return 0;
  
  // Parse multiple bonus tiers like "5+1, 20+5"
  const tiers = bonusStr.split(',').map(s => s.trim());
  let bestBonus = 0;
  
  for (const tier of tiers) {
    const match = tier.match(/(\d+)\+(\d+)/);
    if (match) {
      const buyQty = parseInt(match[1]);
      const freeQty = parseInt(match[2]);
      if (quantity >= buyQty) {
        const bonus = Math.floor(quantity / buyQty) * freeQty;
        if (bonus > bestBonus) bestBonus = bonus;
      }
    }
  }
  
  return bestBonus;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ items, invoiceInfo, invoiceNumber, invoiceDate, orderDate, printDateTime, totals, discountPercent, getItemTp }, ref) => {
    // Calculate subtotal using custom TP values
    const subtotal = items.reduce((sum, item) => sum + getItemTp(item) * item.quantity, 0);
    const { vat } = totals;
    
    // Calculate line item discount (sum of individual discounts based on product bonus/discount)
    const lineItemDiscount = 0; // Can be calculated from item.product.discount if available
    
    // Group discount (customizable percentage of subtotal)
    const groupDiscount = subtotal * (discountPercent / 100);
    
    // Gross TP after all discounts
    const grossTPAfterDiscount = subtotal - lineItemDiscount - groupDiscount;
    
    // Net payable
    const netPayable = grossTPAfterDiscount + vat;

    return (
      <div ref={ref} className="bg-white text-black p-4 text-[11px] font-sans leading-tight relative flex flex-col" style={{ fontFamily: 'Arial, sans-serif', minHeight: '297mm', width: '210mm', boxSizing: 'border-box' }}>
        {/* Watermark Logo - Background */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <img 
            src={fnfLogoColor} 
            alt="" 
            className="w-[400px] h-[400px] object-contain"
            style={{ opacity: 0.15 }}
          />
        </div>
        
        {/* Content wrapper with higher z-index */}
        <div className="relative flex-1 flex flex-col" style={{ zIndex: 1 }}>
          {/* Main Header */}
          <div className="flex justify-between items-start mb-1">
            {/* Corporate Office - Left */}
            <div className="text-[9px] leading-tight">
              <p className="font-bold">Corporate Office:</p>
              <p>Urban Stream Commercial Complex</p>
              <p>Level # 03, 18 New Eskaton</p>
              <p>(R.K. Menon Road) Dhaka-1000.</p>
              <p>Phone: 9336001</p>
            </div>
            
            {/* Center - Logo + Company Name on same line & Invoice Title */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-1">
                <img 
                  src={fnfLogoColor} 
                  alt="FnF Pharmaceuticals Ltd." 
                  className="h-[40px] w-auto object-contain"
                />
                <span className="text-xl font-bold text-blue-600" style={{ lineHeight: '40px' }}>FnF Pharmaceuticals Ltd.</span>
              </div>
              <div className="border-2 border-black px-6 py-1 inline-block" style={{ borderRadius: '15%' }}>
                <span className="text-xl font-bold">INVOICE</span>
              </div>
            </div>
            
            {/* Factory - Right */}
            <div className="text-[9px] leading-tight text-right">
              <p className="font-bold">Factory:</p>
              <p>Rautail, Nagarbathan,</p>
              <p>Jhenaidah, Bangladesh.</p>
              <p>Phone: 0451-63297</p>
            </div>
          </div>
        
        {/* Print Date & Page */}
        <div className="flex justify-between text-[9px] mb-2">
          <span>Printed On: {printDateTime}</span>
          <span>Page 1 of 1</span>
        </div>

        {/* MUSHAK Section */}
        <div className="border-t border-black pt-2 mb-2">
          <div className="flex justify-between items-center">
            <div></div>
            <div className="text-center">
              <p className="font-semibold">FnF Pharmaceuticals Ltd.</p>
              <p className="text-[9px]">[Clauses (c) and (f) of sub-Rule (1) of Rule 40]</p>
            </div>
            <div className="text-right font-semibold">MUSHAK-6.3</div>
          </div>
        </div>

        {/* Depot */}
        <div className="text-center mb-1">
          <span className="font-semibold">Depot: CUMILLA</span>
        </div>

        {/* Contact No & Invoice Title */}
        <div className="text-center mb-3">
          <p className="text-[10px]">Contact No: {invoiceInfo.contactNo}</p>
          <p className="text-2xl font-semibold mt-1">Invoice</p>
        </div>

        {/* Customer & Invoice Info Grid */}
        <div className="grid grid-cols-2 gap-x-8 mb-4 text-[10px]">
          {/* Left Column - Customer Info */}
          <div className="space-y-1">
            <div className="flex">
              <span className="font-bold w-24">Chemist Code</span>
              <span>: <strong>{invoiceInfo.chemistCode}</strong></span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">Chemist Name</span>
              <span>: <strong>{invoiceInfo.chemistName}</strong></span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">BIN No</span>
              <span>: {invoiceInfo.binNo}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">Address</span>
              <span>: {invoiceInfo.address}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">Market</span>
              <span>: <strong>{invoiceInfo.market}</strong></span>
            </div>
            <div className="flex">
              <span className="font-bold w-24">Field Force</span>
              <span>: <strong>{invoiceInfo.fieldForce}</strong></span>
            </div>
          </div>
          
          {/* Right Column - Invoice Info */}
          <div className="space-y-1">
            <div className="flex">
              <span className="font-semibold w-24">Invoice No</span>
              <span>: {invoiceNumber}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">Invoice Date</span>
              <span>: {invoiceDate}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">Order No</span>
              <span>: {invoiceInfo.orderNo}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">Order Date</span>
              <span>: {orderDate}</span>
            </div>
            <div className="flex">
              <span className="font-semibold w-24">Payment Mode</span>
              <span>: {invoiceInfo.paymentMode}</span>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <table className="w-full border-collapse text-[9px] mb-2">
          <thead>
            <tr className="border-t border-b border-black">
              <th className="text-left py-1 font-semibold">Products Name</th>
              <th className="text-center py-1 font-semibold">Quantity</th>
              <th className="text-right py-1 font-semibold">Unit Price<br/>TP/SP</th>
              <th className="text-right py-1 font-semibold">Unit VAT</th>
              <th className="text-right py-1 font-semibold">UnitPrice<br/>With VAT</th>
              <th className="text-center py-1 font-semibold">Bonus</th>
              <th className="text-center py-1 font-semibold">Total:<br/>VAT %</th>
              <th className="text-center py-1 font-semibold">Dis.<br/>DisAmt:</th>
              <th className="text-right py-1 font-semibold">Total<br/>TP/SP</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const itemTp = getItemTp(item);
              const totalTP = itemTp * item.quantity;
              const tpWithVat = itemTp + item.product.vat;
              const bonusQty = calculateBonus(item.product.bonus, item.quantity);
              return (
                <tr key={item.product.id} className="border-b border-dotted border-gray-400">
                  <td className="py-1">{item.product.name} ({item.product.packSize})</td>
                  <td className="text-center py-1">{item.quantity}</td>
                  <td className="text-right py-1">{itemTp.toFixed(2)}</td>
                  <td className="text-right py-1">{item.product.vat.toFixed(2)}</td>
                  <td className="text-right py-1">{tpWithVat.toFixed(2)}</td>
                  <td className="text-center py-1">{bonusQty > 0 ? bonusQty : '-'}</td>
                  <td className="text-center py-1">0</td>
                  <td className="text-center py-1">0</td>
                  <td className="text-right py-1">{totalTP.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Separator Line */}
        <div className="border-t-2 border-dashed border-black mb-3"></div>

        {/* Totals Section */}
        <div className="flex justify-between mb-4">
          {/* In Words - Left */}
          <div className="text-[10px] max-w-[50%]">
            <span className="font-semibold">In Words: </span>
            <span>{numberToWords(Math.round(netPayable))} Taka Only</span>
          </div>
          
          {/* Totals - Right */}
          <div className="text-[10px] space-y-0.5 min-w-[180px]">
            <div className="flex justify-between">
              <span>Gross TP</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Line Item Discount</span>
              <span>-{lineItemDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SubTotal + Group Discount</span>
              <span>-{groupDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gross TP(After Discount)</span>
              <span>{grossTPAfterDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Add VAT on TP</span>
              <span>{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-black pt-1 mt-1 text-black">
              <span>Net Payable</span>
              <span>{netPayable.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer - always at bottom of A4 */}
        <div style={{ marginTop: 'auto' }}>
          {/* Depot Info - Right aligned with separator */}
          <div className="border-t-2 border-black pt-3">
            <div className="text-right mb-12 text-[10px]">
              <p className="font-bold">Cumilla Depot</p>
              <p>For FnF Pharmaceuticals Ltd.</p>
            </div>
          </div>

          {/* Signature Row - evenly spaced */}
          <div className="flex justify-between items-end px-4" style={{ paddingBottom: '10mm' }}>
            <div className="text-center">
              <div className="border-t border-black w-32 mx-auto mb-1"></div>
              <span className="text-[9px] font-medium">Prepared By</span>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-32 mx-auto mb-1"></div>
              <span className="text-[9px] font-medium">Checked By</span>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-32 mx-auto mb-1"></div>
              <span className="text-[9px] font-medium">Authorized Signature</span>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-32 mx-auto mb-1"></div>
              <span className="text-[9px] font-medium">Customer's Signature</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
