import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const categoryDot: Record<string, string> = {
  Bolus: 'bg-cat-bolus',
  Injection: 'bg-cat-injection',
  Liquid: 'bg-cat-liquid',
  Powder: 'bg-cat-powder',
  Vaccine: 'bg-cat-vaccine',
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, updateQuantity, items } = useCart();

  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card shadow-card transition-all duration-200 hover:shadow-lift hover:-translate-y-0.5">
      {/* Category accent strip */}
      <div className={cn('h-1 w-full', categoryDot[product.category])} />

      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', categoryDot[product.category])} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {product.category}
          </span>
        </div>

        <h3 className="font-display text-sm sm:text-[15px] font-semibold leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">{product.packSize}</p>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-base sm:text-lg font-bold leading-none tabular-nums">
              ৳{product.tp_vat.toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 tabular-nums truncate">
              TP ৳{product.tp.toFixed(2)} · VAT ৳{product.vat.toFixed(2)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] uppercase tracking-wide text-muted-foreground leading-none">MRP</p>
            <p className="text-xs font-semibold text-muted-foreground tabular-nums mt-0.5">
              ৳{product.mrp.toFixed(2)}
            </p>
          </div>
        </div>

        {product.bonus !== 'N/A' && (
          <Badge
            variant="secondary"
            className="mt-2 self-start text-[10px] font-semibold px-2 py-0 h-5 bg-accent text-accent-foreground border-none"
          >
            Bonus {product.bonus}
          </Badge>
        )}

        <div className="mt-auto pt-3">
          {quantity > 0 ? (
            <div className="flex items-center justify-between rounded-full bg-accent border border-border/60 p-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove one ${product.name}`}
                className="h-9 w-9 sm:h-8 sm:w-8 rounded-full hover:bg-background"
                onClick={() => updateQuantity(product.id, quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm font-bold tabular-nums">{quantity}</span>
              <Button
                size="icon"
                aria-label={`Add one ${product.name}`}
                className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => addToCart(product)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => addToCart(product)}
              aria-label={`Add ${product.name} to cart`}
              className="w-full h-10 sm:h-9 rounded-full text-sm font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
