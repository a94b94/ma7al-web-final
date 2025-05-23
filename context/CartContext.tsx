"use client";


import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";
type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type FullCart = {
  storeId: string;
  storeName: string;
  cart: CartItem[];
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

const getStorageKey = () => {
  const storeId = localStorage.getItem("selectedStoreId");
  return storeId ? `ma7al_cart_${storeId}` : "ma7al_cart_unknown";
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [fullCart, setFullCart] = useState<FullCart | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          setFullCart(JSON.parse(stored));
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && fullCart) {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(fullCart));
    }
  }, [fullCart]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    const selectedStoreId = localStorage.getItem("selectedStoreId");
    const selectedStoreName = localStorage.getItem("selectedStoreName");

    if (!item.id || !item.price) {
      toast.error("❗ معلومات المنتج غير مكتملة");
      return;
    }

    if (!selectedStoreId || !selectedStoreName) {
      toast.error("❗ يرجى اختيار محل أولاً قبل إضافة المنتجات.");
      return;
    }

    if (fullCart && fullCart.storeId !== selectedStoreId) {
      toast.error("⚠️ لا يمكنك إضافة منتجات من محل مختلف. أفرغ السلة أولاً.");
      return;
    }

    const existingItemIndex = fullCart?.cart.findIndex((i) => i.id === item.id);
    let updatedCart: FullCart;

    if (
      fullCart &&
      fullCart.cart &&
      typeof existingItemIndex === "number" &&
      existingItemIndex >= 0 &&
      fullCart.cart[existingItemIndex]
    ) {
      const newCart = [...fullCart.cart];
      newCart[existingItemIndex] = {
        ...newCart[existingItemIndex],
        quantity: newCart[existingItemIndex].quantity + 1,
      };
      updatedCart = {
        storeId: selectedStoreId,
        storeName: selectedStoreName,
        cart: newCart,
      };
    } else {
      updatedCart = {
        storeId: selectedStoreId,
        storeName: selectedStoreName,
        cart: fullCart?.cart
          ? [...fullCart.cart, { ...item, quantity: 1 }]
          : [{ ...item, quantity: 1 }],
      };
    }

    setFullCart(updatedCart);
    toast.success("✅ تم إضافة المنتج إلى السلة");
  };

  const removeFromCart = (id: string) => {
    if (!fullCart) return;
    const updated = {
      ...fullCart,
      cart: fullCart.cart.filter((item) => item.id !== id),
    };
    setFullCart(updated);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (!fullCart) return;
    const updated = {
      ...fullCart,
      cart: fullCart.cart.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    };
    setFullCart(updated);
  };

  const increaseQty = (id: string) => {
    if (!fullCart) return;
    const item = fullCart.cart.find((item) => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + 1);
    }
  };

  const decreaseQty = (id: string) => {
    if (!fullCart) return;
    const item = fullCart.cart.find((item) => item.id === id);
    if (item && item.quantity > 1) {
      updateQuantity(id, item.quantity - 1);
    }
  };

  const clearCart = () => {
    const key = getStorageKey();
    setFullCart(null);
    localStorage.removeItem(key);
    toast.success("🗑️ تم تفريغ السلة");
  };

  const total =
    fullCart?.cart && Array.isArray(fullCart.cart)
      ? fullCart.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      : 0;

  return (
    <CartContext.Provider
      value={{
        cart: fullCart?.cart || [],
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
