import { useState, useMemo } from 'react';
import { ALL_PRODUCTS } from '@/data/products';
import { ProductCategory } from '@/types/product';
import { ProductCard } from '@/components/ProductCard';
import { CartSheet } from '@/components/CartSheet';
import { InvoiceHistorySheet } from '@/components/InvoiceHistorySheet';
import { Input } from '@/components/ui/input';
import { Search, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = ['All', ...Object.values(ProductCategory)] as const;

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ALL_PRODUCTS.length };
    for (const product of ALL_PRODUCTS) {
      counts[product.category] = (counts[product.category] || 0) + 1;
    }
    return counts;
  }, []);

  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((product) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.packSize.toLowerCase().includes(query);
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* App bar */}
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b shadow-sm">
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <div className="flex items-center justify-between gap-2 pt-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
                <Pill className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-base sm:text-xl font-bold text-foreground leading-tight truncate">
                  FnF Pharmaceuticals
                </h1>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary/80">
                  Invoice Generator
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <InvoiceHistorySheet />
              <CartSheet />
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products or pack size..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-11 sm:h-10 text-base sm:text-sm rounded-xl bg-card shadow-card border-border/70 focus-visible:ring-ring"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2.5 pt-2.5 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            {categories.map((category) => {
              const selected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'h-9 px-3.5 rounded-full text-sm font-medium shrink-0 whitespace-nowrap transition-all duration-150',
                    selected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-ring/50'
                  )}
                >
                  {category}
                  <span
                    className={cn(
                      'ml-1.5 text-xs tabular-nums',
                      selected ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                    )}
                  >
                    {categoryCounts[category] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Products grid */}
      <main className="mx-auto max-w-6xl px-3 sm:px-6 py-4 pb-28 sm:pb-10">
        <p className="text-xs sm:text-sm text-muted-foreground mb-3">
          Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> of{' '}
          {ALL_PRODUCTS.length} products
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
