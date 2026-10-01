/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types/Product';
import { getCartUnitPrice, roundCurrency } from '../utils/cartPricing';

const CART_STORAGE_KEY = 'octocat-cart';
const DISCOUNT_RATE = 0.05;
const SHIPPING_COST = 10;

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  grandTotal: number;
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const isProduct = (value: unknown): value is Product => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const product = value as Partial<Product>;
  return (
    Number.isInteger(product.productId) &&
    typeof product.name === 'string' &&
    typeof product.description === 'string' &&
    typeof product.price === 'number' &&
    typeof product.imgName === 'string' &&
    typeof product.sku === 'string' &&
    typeof product.unit === 'string' &&
    typeof product.supplierId === 'number' &&
    (product.discount === undefined || typeof product.discount === 'number')
  );
};

const readCart = (): CartItem[] => {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (!savedCart) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(savedCart);
  } catch (error) {
    if (error instanceof SyntaxError) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
    throw error;
  }

  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.filter(
    (item): item is CartItem =>
      typeof item === 'object' &&
      item !== null &&
      isProduct((item as Partial<CartItem>).product) &&
      Number.isInteger((item as Partial<CartItem>).quantity) &&
      ((item as Partial<CartItem>).quantity ?? 0) > 0,
  );
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => {
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    const subtotal = roundCurrency(
      items.reduce((total, item) => total + getCartUnitPrice(item.product) * item.quantity, 0),
    );
    const discount = roundCurrency(subtotal * DISCOUNT_RATE);
    const shipping = itemCount > 0 ? SHIPPING_COST : 0;

    return {
      items,
      itemCount,
      subtotal,
      discount,
      shipping,
      grandTotal: roundCurrency(subtotal - discount + shipping),
      addItem: (product: Product, quantity: number) => {
        if (!Number.isInteger(quantity) || quantity <= 0) {
          return;
        }
        setItems((currentItems) => {
          const existingItem = currentItems.find((item) => item.product.productId === product.productId);
          return existingItem
            ? currentItems.map((item) =>
                item.product.productId === product.productId
                  ? { ...item, product, quantity: item.quantity + quantity }
                  : item,
              )
            : [...currentItems, { product, quantity }];
        });
      },
      updateQuantity: (productId: number, quantity: number) => {
        if (!Number.isInteger(quantity)) {
          return;
        }
        setItems((currentItems) =>
          quantity <= 0
            ? currentItems.filter((item) => item.product.productId !== productId)
            : currentItems.map((item) =>
                item.product.productId === productId ? { ...item, quantity } : item,
              ),
        );
      },
      removeItem: (productId: number) => {
        setItems((currentItems) =>
          currentItems.filter((item) => item.product.productId !== productId),
        );
      },
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
