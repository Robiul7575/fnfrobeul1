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
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div ref={ref} style={{
        background: 'white',
        color: 'black',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '13px',
        lineHeight: '1.4',
        width: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        padding: '20px 30px 14px',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Watermark */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 0,
        }}>
          <img src={fnfLogoColor} alt="" style={{ width: '280px', height: '280px', objectFit: 'contain', opacity: 0.08 }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>

          {/* ===== HEADER - 3 columns ===== */}
          <table style={{ width: '100%', tableLayout: 'fixed', marginBottom: '0' }}>
            <colgroup>
              <col style={{ width: '27%' }} />
              <col style={{ width: '46%' }} />
              <col style={{ width: '27%' }} />
            </colgroup>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', fontSize: '11px', lineHeight: '1.5' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '11px' }}>Corporate Office:</p>
                  <p>Urban Stream Commercial Complex</p>
                  <p>Level # 03, 18 New Eskaton</p>
                  <p>(R.K. Menon Road) Dhaka-1000.</p>
                  <p>Phone: 9336001</p>
                </td>
                <td style={{ verticalAlign: 'top', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                    <img src={fnfLogoColor} alt="FnF" style={{ height: '38px', width: 'auto' }} />
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>FnF Pharmaceuticals Ltd.</span>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block', border: '2.5px solid black',
                      padding: '3px 32px', borderRadius: '50px',
                      fontSize: '18px', fontWeight: 'bold',
                    }}>INVOICE</span>
                  </div>
                </td>
                <td style={{ verticalAlign: 'top', textAlign: 'right', fontSize: '11px', lineHeight: '1.5' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '11px' }}>Factory:</p>
                  <p>Rautail, Nagarbathan,</p>
                  <p>Jhenaidah, Bangladesh.</p>
                  <p>Phone: 0451-63297</p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Page info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', margin: '4px 0' }}>
            <span>1 of 1</span>
            <span>{printDateTime}</span>
          </div>

          <div style={{ borderTop: '1px solid black', margin: '2px 0' }} />

          {/* ===== MUSHAK ===== */}
          <table style={{ width: '100%', margin: '4px 0 0' }}>
            <tbody>
              <tr>
                <td style={{ width: '25%' }} />
                <td style={{ textAlign: 'center', width: '50%' }}>
                  <p style={{ fontWeight: 'bold', fontSize: '14px' }}>FnF Pharmaceuticals Ltd.</p>
                  <p style={{ fontSize: '11px' }}>[Clauses (c) and (f) of sub-Rule (1) of Rule 40]</p>
                </td>
                <td style={{ textAlign: 'right', width: '25%', fontWeight: 'bold', fontSize: '13px' }}>MUSHAK-6.3</td>
              </tr>
            </tbody>
          </table>

          <div style={{ textAlign: 'center', marginBottom: '6px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '1px' }}>Depot : CUMILLA</p>
            <p style={{ fontSize: '11px' }}>Contact No : {invoiceInfo.contactNo}</p>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '3px' }}>Invoice</p>
          </div>

          <div style={{ borderTop: '1px solid black', margin: '2px 0' }} />

          {/* ===== CUSTOMER & INVOICE INFO ===== */}
          <table style={{ width: '100%', fontSize: '12px', marginBottom: '4px', marginTop: '4px' }}>
            <tbody>
              <tr>
                <td style={{ width: '50%', verticalAlign: 'top', paddingRight: '16px' }}>
                  <table style={{ width: '100%' }}>
                    <tbody>
                      {([
                        ['Chemist Code', invoiceInfo.chemistCode, true],
                        ['Chemist Name', invoiceInfo.chemistName, true],
                        ['BIN No', invoiceInfo.binNo, false],
                        ['Address', invoiceInfo.address, false],
                        ['Market', invoiceInfo.market, true],
                        ['Field Force', invoiceInfo.fieldForce, true],
                      ] as [string, string, boolean][]).map(([label, value, bold]) => (
                        <tr key={label}>
                          <td style={{ width: '95px', fontWeight: 'bold', padding: '3px 0', whiteSpace: 'nowrap', fontSize: '12px' }}>{label}</td>
                          <td style={{ padding: '3px 0', fontWeight: bold ? 'bold' : 'normal', fontSize: '12px' }}>: {value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td style={{ width: '50%', verticalAlign: 'top' }}>
                  <table style={{ width: '100%' }}>
                    <tbody>
                      {([
                        ['Invoice No', invoiceNumber],
                        ['Invoice Date', invoiceDate],
                        ['Order No', invoiceInfo.orderNo],
                        ['Order Date', orderDate],
                        ['Payment Mode', invoiceInfo.paymentMode],
                      ]).map(([label, value]) => (
                        <tr key={label}>
                          <td style={{ width: '100px', fontWeight: 'bold', padding: '3px 0', whiteSpace: 'nowrap', fontSize: '12px' }}>{label}</td>
                          <td style={{ padding: '3px 0', fontSize: '12px' }}>: {value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ borderTop: '1.5px dashed black', margin: '4px 0' }} />

          {/* ===== PRODUCT TABLE ===== */}
          <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '21%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr style={{ borderTop: '2px solid black', borderBottom: '2px solid black' }}>
                  {[
                    ['Products Name', 'left'],
                    ['Pack Size', 'center'],
                    ['Qty', 'center'],
                    ['Unit TP', 'right'],
                    ['Unit VAT', 'right'],
                    ['TP+VAT', 'right'],
                    ['Bonus', 'center'],
                    ['Dis.', 'center'],
                    ['VAT%', 'center'],
                    ['DisAmt', 'right'],
                    ['Total TP', 'right'],
                  ].map(([text, align]) => (
                    <th key={text} style={{
                      textAlign: align as any,
                      padding: '6px 3px',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      lineHeight: '1.2',
                    }}>{text}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const itemTp = getItemTp(item);
                  const itemDiscount = getItemDiscount(item);
                  const totalTP = (itemTp - itemDiscount) * item.quantity;
                  const tpWithVat = itemTp + item.product.vat;
                  const bonusQty = calculateBonus(item.product.bonus, item.quantity);
                  const rowStyle = { padding: '5px 3px', fontSize: '12px' };
                  return (
                    <React.Fragment key={item.product.id}>
                      <tr style={{ borderBottom: '1px dashed #bbb' }}>
                        <td style={{ ...rowStyle, textAlign: 'left' }}>{item.product.name} {item.product.packSize}</td>
                        <td style={{ ...rowStyle, textAlign: 'center' }}>{item.product.packSize}</td>
                        <td style={{ ...rowStyle, textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ ...rowStyle, textAlign: 'right' }}>{itemTp.toFixed(2)}</td>
                        <td style={{ ...rowStyle, textAlign: 'right' }}>{item.product.vat.toFixed(2)}</td>
                        <td style={{ ...rowStyle, textAlign: 'right' }}>{tpWithVat.toFixed(2)}</td>
                        <td style={{ ...rowStyle, textAlign: 'center' }}>0</td>
                        <td style={{ ...rowStyle, textAlign: 'center' }}>0</td>
                        <td style={{ ...rowStyle, textAlign: 'center' }}>0</td>
                        <td style={{ ...rowStyle, textAlign: 'right' }}>{itemDiscount > 0 ? (itemDiscount * item.quantity).toFixed(2) : '0.00'}</td>
                        <td style={{ ...rowStyle, textAlign: 'right' }}>{totalTP.toFixed(2)}</td>
                      </tr>
                      {bonusQty > 0 && (
                        <tr style={{ borderBottom: '1px dashed #bbb' }}>
                          <td style={{ ...rowStyle, textAlign: 'left' }}>{item.product.name} {item.product.packSize}</td>
                          <td style={{ ...rowStyle, textAlign: 'center' }}>{item.product.packSize}</td>
                          <td style={{ ...rowStyle, textAlign: 'center' }}>{bonusQty}</td>
                          <td style={{ ...rowStyle, textAlign: 'right' }}>0.00</td>
                          <td style={{ ...rowStyle, textAlign: 'right' }}>0.00</td>
                          <td style={{ ...rowStyle, textAlign: 'right' }}>0.00</td>
                          <td style={{ ...rowStyle, textAlign: 'center' }}>0</td>
                          <td style={{ ...rowStyle, textAlign: 'center' }}>0</td>
                          <td style={{ ...rowStyle, textAlign: 'center' }}>0</td>
                          <td style={{ ...rowStyle, textAlign: 'right' }}>0.00</td>
                          <td style={{ ...rowStyle, textAlign: 'right' }}>0.00</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                <tr style={{ borderTop: '1.5px solid black' }}>
                  <td style={{ padding: '5px 3px', fontSize: '12px', fontWeight: 'bold' }}>Total</td>
                  <td />
                  <td style={{ textAlign: 'center', padding: '5px 3px', fontSize: '12px', fontWeight: 'bold' }}>{totalQty}</td>
                  <td colSpan={8} />
                </tr>
              </tbody>
            </table>

            <div style={{ borderTop: '1.5px dashed black', margin: '6px 0' }} />

            {/* ===== TOTALS ===== */}
            <table style={{ width: '100%', marginBottom: '6px', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '48%' }} />
                <col style={{ width: '52%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top', fontSize: '12px', paddingRight: '16px', paddingTop: '4px' }}>
                    <span style={{ fontWeight: 'bold' }}>In Words: </span>
                    <span>{numberToWords(Math.round(netPayable))} Taka Only</span>
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        {([
                          ['Gross TP', subtotal.toFixed(2)],
                          ['Line Item Discount', `- ${lineItemDiscount.toFixed(2)}`],
                          ['SubTotal + Group Discount', `- ${groupDiscount.toFixed(2)}`],
                          ['Gross TP(After Discount)', grossTPAfterDiscount.toFixed(2)],
                          ['Add VAT on TP', vat.toFixed(2)],
                        ]).map(([label, val]) => (
                          <tr key={label}>
                            <td style={{ padding: '2px 0', textAlign: 'left', fontSize: '13px' }}>{label}</td>
                            <td style={{ padding: '2px 0', textAlign: 'right', fontSize: '13px' }}>{val}</td>
                          </tr>
                        ))}
                        <tr style={{ borderTop: '2.5px solid black' }}>
                          <td style={{ padding: '5px 0 0', textAlign: 'left', fontWeight: 'bold', fontSize: '16px' }}>Net Payable</td>
                          <td style={{ padding: '5px 0 0', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>{netPayable.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ===== FOOTER ===== */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ textAlign: 'right', marginBottom: '4px', fontSize: '12px' }}>
              <p style={{ fontWeight: 'bold' }}>Cumilla Depot</p>
              <p>For FnF Pharmaceuticals Ltd.</p>
            </div>

            <div style={{ borderTop: '1px solid black', margin: '2px 0' }} />

            <table style={{ width: '100%', marginTop: '4px' }}>
              <tbody>
                <tr>
                  {['PREPARED BY', 'CHECKED BY', 'AUTHORIZED SIGNATURE', "CUSTOMER'S SIGNATURE"].map(label => (
                    <td key={label} style={{ textAlign: 'center', width: '25%', fontSize: '10px', verticalAlign: 'bottom', paddingTop: '28px' }}>
                      <div style={{ borderTop: '1px solid black', width: '120px', margin: '0 auto 3px' }} />
                      <span style={{ fontWeight: 600 }}>{label}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'center', fontSize: '9px', marginTop: '4px' }}>
              <p>For F n F Pharmaceuticals Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';
