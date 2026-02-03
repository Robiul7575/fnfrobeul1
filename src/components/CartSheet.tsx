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
import { ShoppingCart, Trash2, Plus, Minus, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { InvoiceModal } from './InvoiceModal';
import { InvoiceInfoDialog, InvoiceInfo } from './InvoiceInfoDialog';

export function CartSheet() {
  const { items, removeFromCart, updateQuantity, getTotals, itemCount, clearCart } = useCart();
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
                  {items.map((item) => (
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
                        <p className="text-sm font-medium mt-1">
                          ৳{item.product.tp_vat.toFixed(2)} each
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
                          ৳{(item.product.tp_vat * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal (TP)</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT</span>
                  <span>৳{vat.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total (TP+VAT)</span>
                  <span>৳{total.toFixed(2)}</span>
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
