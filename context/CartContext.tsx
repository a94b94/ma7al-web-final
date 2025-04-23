import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";

// ✅ نوع العنصر في السلة
type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

// ✅ شكل السلة الكامل المرتبط بمحل
type FullCart = {
  storeId: string;
  storeName: string;
  cart: CartItem[];
};

// ✅ البيانات التي يوفرها الـ Context
type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
};

// ✅ إنشاء الـ Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// ✅ هوك لاستخدامه بسهولة
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// ✅ مزود السياق
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [fullCart, setFullCart] = useState<FullCart | null>(null);

  // ⬇️ تحميل السلة من localStorage عند تشغيل الصفحة
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      if (stored) {
        try {
          setFullCart(JSON.parse(stored));
        } catch {
          localStorage.removeItem("cart");
        }
      }
    }
  }, []);

  // ⬆️ حفظ السلة إلى localStorage عند أي تغيير
  useEffect(() => {
    if (typeof window !== "undefined" && fullCart) {
      localStorage.setItem("cart", JSON.stringify(fullCart));
    }
  }, [fullCart]);

  // ✅ إضافة منتج إلى السلة
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

    if (fullCart && fullCart.cart && existingItemIndex !== -1) {
      const newCart = [...fullCart.cart];
      newCart[existingItemIndex].quantity += 1;
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

  // ✅ حذف منتج
  const removeFromCart = (id: string) => {
    if (!fullCart) return;
    const updated = {
      ...fullCart,
      cart: fullCart.cart.filter((item) => item.id !== id),
    };
    setFullCart(updated);
  };

  // ✅ تعديل كمية منتج
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

  // ✅ تفريغ السلة
  const clearCart = () => {
    setFullCart(null);
    localStorage.removeItem("cart");
    toast.success("🗑️ تم تفريغ السلة");
  };

  // ✅ المجموع الكلي (مع تحقق إضافي لحل الخطأ)
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
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
