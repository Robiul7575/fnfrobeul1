import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Trash2, Plus, Minus, FileText, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { InvoiceModal } from './InvoiceModal';
import { InvoiceInfoDialog, InvoiceInfo } from './InvoiceInfoDialog';
import { Label } from '@/components/ui/label';

export function CartSheet() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    updateCustomTp,
    getTotals, 
    itemCount, 
    clearCart,
    discountPercent,
    setDiscountPercent,
    getItemTp
  } = useCart();
  const { subtotal, vat, total } = getTotals();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceInfo>({
    chemistName: '',
    chemistCode: '',
    binNo: '',
    address: '',
    market: '',
    fieldForce: '',
    contactNo: '',
    orderNo: '',
    paymentMode: 'Cash',
  });

  const handleInfoSubmit = (info: InvoiceInfo) => {
    setInvoiceInfo(info);
    setShowInvoice(true);
  };

  // Calculate with discount
  const discountAmount = subtotal * (discountPercent / 100);
  const afterDiscount = subtotal - discountAmount;
  const netPayable = afterDiscount + vat;

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {itemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart ({itemCount} items)
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 py-4">
                  {items.map((item) => {
                    const currentTp = getItemTp(item);
                    const itemVat = item.product.vat;
                    const tpWithVat = currentTp + itemVat;
                    
                    return (
                      <div
                        key={item.product.id}
                        className="flex gap-3 p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.product.packSize}
                          </p>
                          
                          {/* Editable TP */}
                          <div className="flex items-center gap-2 mt-2">
                            <Label className="text-xs text-muted-foreground">TP:</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.customTp !== undefined ? item.customTp : item.product.tp}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value) && value >= 0) {
                                  updateCustomTp(item.product.id, value);
                                } else if (e.target.value === '') {
                                  updateCustomTp(item.product.id, undefined);
                                }
                              }}
                              className="w-20 h-6 text-xs"
                            />
                            {item.customTp !== undefined && item.customTp !== item.product.tp && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => updateCustomTp(item.product.id, undefined)}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                          
                          <p className="text-sm font-medium mt-1">
                            ৳{tpWithVat.toFixed(2)} each (incl. VAT)
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.product.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-14 h-7 text-center text-sm"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-semibold">
                            ৳{(tpWithVat * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross TP</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                
                {/* Editable Cash Discount */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Cash Discount</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 100) {
                            setDiscountPercent(value);
                          }
                        }}
                        className="w-14 h-6 text-xs text-center"
                      />
                      <Percent className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  <span className="text-destructive">-৳{discountAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After Discount</span>
                  <span>৳{afterDiscount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT</span>
                  <span>৳{vat.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Net Payable</span>
                  <span>৳{netPayable.toFixed(2)}</span>
                </div>
              </div>

              <SheetFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={clearCart} className="flex-1">
                  Clear Cart
                </Button>
                <Button onClick={() => setShowInfoDialog(true)} className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Invoice
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <InvoiceInfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        onSubmit={handleInfoSubmit}
      />

      <InvoiceModal
        open={showInvoice}
        onOpenChange={setShowInvoice}
        invoiceInfo={invoiceInfo}
      />
    </>
  );
}
