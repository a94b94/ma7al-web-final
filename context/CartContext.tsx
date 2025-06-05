"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";

// ✅ تعريف العنصر في السلة
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  storeId: string;
  storeName: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

const CART_KEY = "ma7al_cart_multi";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) {
        try {
          setCart(JSON.parse(stored));
        } catch {
          localStorage.removeItem(CART_KEY);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    if (!item.id || !item.price || !item.storeId || !item.storeName) {
      toast.error("❗ معلومات المنتج غير مكتملة");
      return;
    }

    const existingIndex = cart.findIndex((i) => i.id === item.id);
    let updated: CartItem[];

    if (existingIndex >= 0) {
      updated = [...cart];
      updated[existingIndex].quantity += 1;
    } else {
      updated = [...cart, { ...item, quantity: 1 }];
    }

    setCart(updated);
    toast.success("✅ تم إضافة المنتج إلى السلة");
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const increaseQty = (id: string) => {
    const item = cart.find((item) => item.id === id);
    if (item) updateQuantity(id, item.quantity + 1);
  };

  const decreaseQty = (id: string) => {
    const item = cart.find((item) => item.id === id);
    if (item && item.quantity > 1) updateQuantity(id, item.quantity - 1);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
    toast.success("🗑️ تم تفريغ السلة");
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        increaseQty,
        decreaseQty,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
