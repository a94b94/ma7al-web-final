import { useEffect, useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";

// ✅ خفف JS الأولي: حمّل الثقيل بعدين
const HeroSection = dynamic(() => import("@/components/HeroSection"), {
  ssr: true,
});
const SeasonalHero = dynamic(() => import("@/components/SeasonalHero"), {
  ssr: false,
});
const CategoriesSection = dynamic(
  () => import("@/components/CategoriesSection"),
  { ssr: true }
);
const PromoBanner = dynamic(() => import("@/components/PromoBanner"), {
  ssr: false,
});
const CountdownBanner = dynamic(() => import("@/components/CountdownBanner"), {
  ssr: false,
});
const DailyDealBanner = dynamic(() => import("@/components/DailyDealBanner"), {
  ssr: false,
});
const ProductSlider = dynamic(() => import("@/components/ProductSlider"), {
  ssr: false,
});
const InteractiveNavbar = dynamic(
  () => import("@/components/shared/InteractiveNavbar"),
  { ssr: true }
);
const MobileBottomNav = dynamic(
  () => import("@/components/shared/MobileBottomNav"),
  { ssr: false }
);
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });

// ✅ Fetcher ثابت (يدعم خطأ HTTP)
async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${text}`);
  }
  return res.json();
}

// ✅ إعدادات SWR موحدة للأداء (بدون إعادة تحميل مزعجة)
const swrOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30_000,
  keepPreviousData: true,
};

export default function HomePage() {
  const { user } = useUser();
  const { addToCart } = useCart();

  const [guestId, setGuestId] = useState<string>("");

  // ✅ اقرأ guestId مرة واحدة بعد mount
  useEffect(() => {
    const id = localStorage.getItem("guestId");
    if (id) setGuestId(id);
  }, []);

  // ✅ userId ثابت لتجنّب rerender keys
  const userId = useMemo(() => {
    return user?.phone || guestId || "";
  }, [user?.phone, guestId]);

  // ✅ SWR للخصم
  const {
    data: discountProducts,
    isLoading: loadingDiscount,
    error: discountError,
  } = useSWR<any[]>("/api/products/discount", fetcher, swrOptions);

  // ✅ SWR للجديد
  const {
    data: newProducts,
    isLoading: loadingNew,
    error: newError,
  } = useSWR<any[]>("/api/products/new", fetcher, swrOptions);

  // ✅ SWR للمقترحات (فقط إذا عندك userId)
  const {
    data: recData,
    isLoading: loadingRec,
    error: recError,
  } = useSWR(
    userId ? `/api/recommendations?userId=${encodeURIComponent(userId)}` : null,
    fetcher,
    swrOptions
  );

  const loading = loadingDiscount || loadingNew;

  const handleAddToCart = useCallback(
    (product: any) => {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        storeId: product.storeId,
        storeName: product.storeName,
      });
    },
    [addToCart]
  );

  // ✅ ضمان arrays حتى ما ينكسر السلايدر
  const safeDiscount = Array.isArray(discountProducts) ? discountProducts : [];
  const safeNew = Array.isArray(newProducts) ? newProducts : [];
  const safeRecommended = Array.isArray(recData?.recommended)
    ? recData.recommended
    : [];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <InteractiveNavbar />

      <motion.main
        className="max-w-7xl mx-auto px-2 sm:px-4 pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        <HeroSection />
        <SeasonalHero />
        <CategoriesSection />
        <PromoBanner />
        <CountdownBanner />
        <DailyDealBanner />

        {/* 🔥 عروض مميزة */}
        <motion.h2
          className="text-2xl font-bold text-center mt-10 text-indigo-700 dark:text-indigo-400"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          🔥 المنتجات المميزة
        </motion.h2>

        <ProductSlider
          key="discount"
          products={safeDiscount}
          loading={loading}
          onAddToCart={handleAddToCart}
        />

        {/* 🆕 جديد */}
        <motion.h2
          className="text-2xl font-bold text-center mt-10 text-green-700 dark:text-green-400"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          🆕 وصل حديثًا
        </motion.h2>

        <ProductSlider
          key="new"
          products={safeNew}
          loading={loading}
          onAddToCart={handleAddToCart}
        />

        {/* 🤖 مقترحات */}
        {safeRecommended.length > 0 && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h3 className="text-2xl font-bold text-center text-purple-600 mb-6">
              🧠 مقترحات مخصصة لك
            </h3>

            <ProductSlider
              key="recommendations"
              products={safeRecommended}
              loading={loadingRec}
              onAddToCart={handleAddToCart}
            />
          </motion.div>
        )}

        {/* (اختياري) Debug بسيط للأخطاء أثناء التطوير */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-8 text-xs opacity-60">
            {discountError && <div>discountError: {String(discountError)}</div>}
            {newError && <div>newError: {String(newError)}</div>}
            {recError && <div>recError: {String(recError)}</div>}
          </div>
        )}
      </motion.main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}
