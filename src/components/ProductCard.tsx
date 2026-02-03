import { Product } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const categoryColors: Record<string, string> = {
  Bolus: 'bg-blue-500',
  Injection: 'bg-red-500',
  Liquid: 'bg-green-500',
  Powder: 'bg-orange-500',
  Vaccine: 'bg-purple-500',
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
          <Badge className={`${categoryColors[product.category]} text-white shrink-0`}>
            {product.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{product.packSize}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">TP:</span>
            <span className="ml-1 font-medium">৳{product.tp.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">VAT:</span>
            <span className="ml-1 font-medium">৳{product.vat.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">TP+VAT:</span>
            <span className="ml-1 font-medium">৳{product.tp_vat.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">MRP:</span>
            <span className="ml-1 font-semibold text-primary">৳{product.mrp.toFixed(2)}</span>
          </div>
        </div>
        {product.bonus !== 'N/A' && (
          <div className="mt-3 pt-3 border-t">
            <Badge variant="secondary" className="text-xs">
              Bonus: {product.bonus}
            </Badge>
          </div>
        )}
        <div className="mt-auto pt-3">
          <Button
            onClick={handleAddToCart}
            className="w-full"
            variant={added ? 'secondary' : 'default'}
            size="sm"
          >
            {added ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
