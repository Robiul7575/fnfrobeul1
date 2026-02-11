import React, { forwardRef } from 'react';
import { CartItem } from '@/context/CartContext';
import { InvoiceInfo } from './InvoiceInfoDialog';
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

function calculateBonus(bonusStr: string, quantity: number): number {
  if (!bonusStr || bonusStr === 'N/A') return 0;
  if (bonusStr.includes('Flat Rate')) return 0;
  
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
    const subtotal = items.reduce((sum, item) => sum + getItemTp(item) * item.quantity, 0);
    const { vat } = totals;
    
    const getItemDiscount = (item: CartItem): number => {
      if (item.product.name.includes('ND+IBD')) {
        if (item.product.packSize.includes('250')) return 100;
        return 300;
      }
      return 0;
    };
    const lineItemDiscount = items.reduce((sum, item) => sum + getItemDiscount(item) * item.quantity, 0);
    const groupDiscount = subtotal * (discountPercent / 100);
    const grossTPAfterDiscount = subtotal - lineItemDiscount - groupDiscount;
    const netPayable = grossTPAfterDiscount + vat;

    return (
      <div
        ref={ref}
        style={{
          background: 'white',
          color: 'black',
          fontFamily: 'Arial, sans-serif',
          fontSize: '10px',
          lineHeight: '1.4',
          width: '210mm',
          minHeight: '297mm',
          padding: '8mm 10mm',
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Watermark */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
          <img src={fnfLogoColor} alt="" style={{ width: '350px', height: '350px', objectFit: 'contain', opacity: 0.12 }} />
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* === HEADER === */}
          <table style={{ width: '100%', marginBottom: '4px' }}>
            <tbody>
              <tr>
                {/* Left - Corporate Office */}
                <td style={{ width: '28%', verticalAlign: 'top', fontSize: '8px', lineHeight: '1.4' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '1px' }}>Corporate Office:</p>
                  <p>Urban Stream Commercial Complex</p>
                  <p>Level # 03, 18 New Eskaton</p>
                  <p>(R.K. Menon Road) Dhaka-1000.</p>
                  <p>Phone: 9336001</p>
                </td>
                {/* Center - Logo + Company */}
                <td style={{ width: '44%', verticalAlign: 'top', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
                    <img src={fnfLogoColor} alt="FnF" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>FnF Pharmaceuticals Ltd.</span>
                  </div>
                  <div style={{ display: 'inline-block', border: '2px solid black', padding: '2px 20px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>INVOICE</span>
                  </div>
                </td>
                {/* Right - Factory */}
                <td style={{ width: '28%', verticalAlign: 'top', textAlign: 'right', fontSize: '8px', lineHeight: '1.4' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '1px' }}>Factory:</p>
                  <p>Rautail, Nagarbathan,</p>
                  <p>Jhenaidah, Bangladesh.</p>
                  <p>Phone: 0451-63297</p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Print Date & Page */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', marginBottom: '6px' }}>
            <span>Printed On: {printDateTime}</span>
            <span>Page 1 of 1</span>
          </div>

          {/* MUSHAK */}
          <div style={{ borderTop: '1px solid black', paddingTop: '4px', marginBottom: '4px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '25%' }}></td>
                  <td style={{ textAlign: 'center', width: '50%' }}>
                    <p style={{ fontWeight: 600 }}>FnF Pharmaceuticals Ltd.</p>
                    <p style={{ fontSize: '8px' }}>[Clauses (c) and (f) of sub-Rule (1) of Rule 40]</p>
                  </td>
                  <td style={{ textAlign: 'right', width: '25%', fontWeight: 600 }}>MUSHAK-6.3</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Depot */}
          <div style={{ textAlign: 'center', marginBottom: '2px', fontWeight: 600 }}>Depot: CUMILLA</div>

          {/* Contact & Invoice subtitle */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <p style={{ fontSize: '9px' }}>Contact No: {invoiceInfo.contactNo}</p>
            <p style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>Invoice</p>
          </div>

          {/* Customer & Invoice Info */}
          <table style={{ width: '100%', marginBottom: '10px', fontSize: '9px' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '16px' }}>
                  <table style={{ width: '100%' }}>
                    <tbody>
                      {[
                        ['Chemist Code', invoiceInfo.chemistCode, true],
                        ['Chemist Name', invoiceInfo.chemistName, true],
                        ['BIN No', invoiceInfo.binNo, false],
                        ['Address', invoiceInfo.address, false],
                        ['Market', invoiceInfo.market, true],
                        ['Field Force', invoiceInfo.fieldForce, true],
                      ].map(([label, value, bold]) => (
                        <tr key={label as string}>
                          <td style={{ width: '90px', fontWeight: bold ? 'bold' : 600, padding: '1px 0' }}>{label as string}</td>
                          <td style={{ padding: '1px 0', fontWeight: bold ? 'bold' : 'normal' }}>: {value as string}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td style={{ width: '50%', verticalAlign: 'top' }}>
                  <table style={{ width: '100%' }}>
                    <tbody>
                      {[
                        ['Invoice No', invoiceNumber],
                        ['Invoice Date', invoiceDate],
                        ['Order No', invoiceInfo.orderNo],
                        ['Order Date', orderDate],
                        ['Payment Mode', invoiceInfo.paymentMode],
                      ].map(([label, value]) => (
                        <tr key={label}>
                          <td style={{ width: '90px', fontWeight: 600, padding: '1px 0' }}>{label}</td>
                          <td style={{ padding: '1px 0' }}>: {value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Products Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px', marginBottom: '6px' }}>
            <thead>
              <tr style={{ borderTop: '1.5px solid black', borderBottom: '1.5px solid black' }}>
                <th style={{ textAlign: 'left', padding: '3px 2px', fontWeight: 600, width: '28%' }}>Products Name</th>
                <th style={{ textAlign: 'center', padding: '3px 2px', fontWeight: 600, width: '10%' }}>Pack Size</th>
                <th style={{ textAlign: 'center', padding: '3px 2px', fontWeight: 600, width: '6%' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '3px 2px', fontWeight: 600, width: '10%' }}>Unit TP/SP</th>
                <th style={{ textAlign: 'right', padding: '3px 2px', fontWeight: 600, width: '8%' }}>Unit VAT</th>
                <th style={{ textAlign: 'right', padding: '3px 2px', fontWeight: 600, width: '10%' }}>TP+VAT</th>
                <th style={{ textAlign: 'center', padding: '3px 2px', fontWeight: 600, width: '6%' }}>Bonus</th>
                <th style={{ textAlign: 'center', padding: '3px 2px', fontWeight: 600, width: '6%' }}>VAT%</th>
                <th style={{ textAlign: 'right', padding: '3px 2px', fontWeight: 600, width: '8%' }}>Dis. Amt</th>
                <th style={{ textAlign: 'right', padding: '3px 2px', fontWeight: 600, width: '10%' }}>Total TP/SP</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const itemTp = getItemTp(item);
                const itemDiscount = getItemDiscount(item);
                const totalTP = (itemTp - itemDiscount) * item.quantity;
                const tpWithVat = itemTp + item.product.vat;
                const bonusQty = calculateBonus(item.product.bonus, item.quantity);
                return (
                  <React.Fragment key={item.product.id}>
                    <tr style={{ borderBottom: '1px dotted #9ca3af' }}>
                      <td style={{ padding: '3px 2px' }}>{item.product.name} ({item.product.packSize})</td>
                      <td style={{ textAlign: 'center', padding: '3px 2px' }}>{item.product.packSize}</td>
                      <td style={{ textAlign: 'center', padding: '3px 2px' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '3px 2px' }}>{itemTp.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '3px 2px' }}>{item.product.vat.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '3px 2px' }}>{tpWithVat.toFixed(2)}</td>
                      <td style={{ textAlign: 'center', padding: '3px 2px' }}>-</td>
                      <td style={{ textAlign: 'center', padding: '3px 2px' }}>0</td>
                      <td style={{ textAlign: 'right', padding: '3px 2px' }}>{itemDiscount > 0 ? (itemDiscount * item.quantity).toFixed(2) : '0'}</td>
                      <td style={{ textAlign: 'right', padding: '3px 2px' }}>{totalTP.toFixed(2)}</td>
                    </tr>
                    {bonusQty > 0 && (
                      <tr style={{ borderBottom: '1px dotted #d1d5db', color: '#4b5563', fontStyle: 'italic' }}>
                        <td style={{ padding: '3px 2px' }}>{item.product.name} ({item.product.packSize}) [Bonus]</td>
                        <td style={{ textAlign: 'center', padding: '3px 2px' }}>{item.product.packSize}</td>
                        <td style={{ textAlign: 'center', padding: '3px 2px' }}>{bonusQty}</td>
                        <td style={{ textAlign: 'right', padding: '3px 2px' }}>0.00</td>
                        <td style={{ textAlign: 'right', padding: '3px 2px' }}>0.00</td>
                        <td style={{ textAlign: 'right', padding: '3px 2px' }}>0.00</td>
                        <td style={{ textAlign: 'center', padding: '3px 2px' }}>-</td>
                        <td style={{ textAlign: 'center', padding: '3px 2px' }}>0</td>
                        <td style={{ textAlign: 'right', padding: '3px 2px' }}>0</td>
                        <td style={{ textAlign: 'right', padding: '3px 2px' }}>0.00</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Separator */}
          <div style={{ borderTop: '2px dashed black', marginBottom: '8px' }}></div>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', maxWidth: '50%' }}>
              <span style={{ fontWeight: 600 }}>In Words: </span>
              <span>{numberToWords(Math.round(netPayable))} Taka Only</span>
            </div>
            <div style={{ fontSize: '9px', minWidth: '180px' }}>
              {[
                ['Gross TP', subtotal.toFixed(2)],
                ['Line Item Discount', `-${lineItemDiscount.toFixed(2)}`],
                ['Group Discount', `-${groupDiscount.toFixed(2)}`],
                ['Gross TP (After Disc.)', grossTPAfterDiscount.toFixed(2)],
                ['Add VAT on TP', vat.toFixed(2)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1px' }}>
                  <span>{label}</span>
                  <span>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid black', paddingTop: '3px', marginTop: '3px' }}>
                <span>Net Payable</span>
                <span>{netPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ borderTop: '2px solid black', paddingTop: '8px' }}>
              <div style={{ textAlign: 'right', marginBottom: '40px', fontSize: '9px' }}>
                <p style={{ fontWeight: 'bold' }}>Cumilla Depot</p>
                <p>For FnF Pharmaceuticals Ltd.</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10mm' }}>
              {['Prepared By', 'Checked By', 'Authorized Signature', "Customer's Signature"].map(label => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid black', width: '120px', margin: '0 auto 3px' }}></div>
                  <span style={{ fontSize: '8px', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
