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
import { ShoppingCart, Trash2, Plus, Minus, Percent, Crown, ChevronRight } from 'lucide-react';
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
          <Button
            size="icon"
            aria-label="Open cart"
            className="relative h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-[10px] font-bold bg-secondary text-secondary-foreground border-none">
                {itemCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        {/* Floating cart bar (phones) */}
        {itemCount > 0 && (
          <SheetTrigger asChild>
            <button
              aria-label={`Open cart, ${itemCount} items, net payable ${netPayable.toFixed(2)} taka`}
              className="sm:hidden fixed bottom-0 inset-x-0 z-40 block w-full border-0 bg-transparent p-0 cursor-pointer"
            >
              <div
                className="mx-3 mb-3 rounded-2xl bg-primary text-primary-foreground shadow-lift px-4 flex items-center justify-between gap-3"
                style={{ paddingTop: '0.8rem', paddingBottom: 'calc(0.8rem + env(safe-area-inset-bottom))' }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative shrink-0">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute -top-2 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary-foreground text-primary text-[10px] font-bold flex items-center justify-center">
                      {itemCount}
                    </span>
                  </span>
                  <span className="text-sm font-bold tabular-nums truncate">
                    ৳{netPayable.toFixed(2)}
                    <span className="ml-1 font-medium text-primary-foreground/70 text-xs">net</span>
                  </span>
                </div>
                <span className="flex items-center gap-0.5 text-sm font-semibold bg-primary-foreground/15 rounded-full px-3 py-1.5 shrink-0">
                  View Cart
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          </SheetTrigger>
        )}

        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
          <SheetHeader className="p-4 pb-2 border-b border-border/60 bg-card rounded-t-2xl">
            <SheetTitle className="flex items-center gap-2 font-display">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Cart ({itemCount} items)
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1">
                <div className="space-y-2.5 p-4">
                  {items.map((item) => {
                    const currentTp = getItemTp(item);
                    const itemVat = item.product.vat;
                    const tpWithVat = currentTp + itemVat;

                    return (
                      <div
                        key={item.product.id}
                        className="flex gap-3 p-3 rounded-xl border border-border/70 bg-card shadow-card"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-semibold text-sm leading-snug line-clamp-2">
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
                              inputMode="decimal"
                              value={item.customTp !== undefined ? item.customTp : item.product.tp}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value) && value >= 0) {
                                  updateCustomTp(item.product.id, value);
                                } else if (e.target.value === '') {
                                  updateCustomTp(item.product.id, undefined);
                                }
                              }}
                              className="w-20 h-8 sm:h-7 text-xs rounded-lg"
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

                          <p className="text-sm font-semibold mt-1.5 tabular-nums">
                            ৳{tpWithVat.toFixed(2)} <span className="font-normal text-muted-foreground text-xs">each (incl. VAT)</span>
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-destructive/10"
                            aria-label={`Remove ${item.product.name}`}
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Decrease quantity"
                              className="h-9 w-9 sm:h-7 sm:w-7 rounded-full"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-4 w-4 sm:h-3 sm:w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              inputMode="numeric"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.product.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-14 h-9 sm:h-7 text-center text-sm rounded-lg"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Increase quantity"
                              className="h-9 w-9 sm:h-7 sm:w-7 rounded-full"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-bold tabular-nums">
                            ৳{(tpWithVat * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="border-t border-border/60 bg-card p-4 space-y-2.5 rounded-b-2xl">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross TP</span>
                  <span className="tabular-nums">৳{subtotal.toFixed(2)}</span>
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
                        inputMode="decimal"
                        value={discountPercent}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value) && value >= 0 && value <= 100) {
                            setDiscountPercent(value);
                          }
                        }}
                        className="w-14 h-8 sm:h-7 text-xs text-center rounded-lg"
                      />
                      <Percent className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  <span className="text-destructive tabular-nums">-৳{discountAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After Discount</span>
                  <span className="tabular-nums">৳{afterDiscount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT</span>
                  <span className="tabular-nums">৳{vat.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg font-display">
                  <span>Net Payable</span>
                  <span className="tabular-nums">৳{netPayable.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  Total before discount: ৳{total.toFixed(2)}
                </p>
              </div>

              <SheetFooter className="gap-2 sm:gap-2 flex-col sm:flex-row p-4 pt-0 border-t border-border/60">
                <Button variant="outline" onClick={clearCart} className="flex-1 h-11 sm:h-10 rounded-xl">
                  Clear Cart
                </Button>
                <Button
                  onClick={() => setShowInfoDialog(true)}
                  className="flex-1 h-11 sm:h-10 relative rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30 font-semibold"
                >
                  <Crown className="h-4 w-4 mr-2 fill-current" />
                  Generate Invoice
                  <Badge className="absolute -top-2.5 -right-2 h-5 px-1.5 text-[10px] font-bold uppercase tracking-wide bg-foreground text-background">
                    Premium
                  </Badge>
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
