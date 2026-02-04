import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
  customTp?: number; // Custom TP override
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateCustomTp: (productId: number, customTp: number | undefined) => void;
  clearCart: () => void;
  getTotals: () => { subtotal: number; vat: number; total: number };
  itemCount: number;
  discountPercent: number;
  setDiscountPercent: (percent: number) => void;
  getItemTp: (item: CartItem) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(2); // Default 2% cash discount

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const updateCustomTp = (productId: number, customTp: number | undefined) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, customTp } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const getItemTp = (item: CartItem): number => {
    return item.customTp !== undefined ? item.customTp : item.product.tp;
  };

  const getTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + getItemTp(item) * item.quantity,
      0
    );
    const vat = items.reduce(
      (sum, item) => sum + item.product.vat * item.quantity,
      0
    );
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCustomTp,
        clearCart,
        getTotals,
        itemCount,
        discountPercent,
        setDiscountPercent,
        getItemTp,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
