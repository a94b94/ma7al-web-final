"use client";

import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import CategoriesSection from "@/components/CategoriesSection";
import PromoBanner from "@/components/PromoBanner";
import CountdownBanner from "@/components/CountdownBanner";
import DailyDealBanner from "@/components/DailyDealBanner";
import SeasonalHero from "@/components/SeasonalHero";
import ProductSlider from "@/components/ProductSlider";
import InteractiveNavbar from "@/components/shared/InteractiveNavbar";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import useSWR from "swr";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json();
};

function formatCountdown(ms: number) {
  if (ms <= 0) return "انتهى العرض";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor((totalSeconds / 3600) % 24);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${hours} س ${minutes} د ${seconds} ث`;
}

const SectionTitle = ({
  children,
  color = "text-indigo-700 dark:text-indigo-400",
  delay = 0,
}: {
  children: ReactNode;
  color?: string;
  delay?: number;
}) => (
  <motion.h2
    className={`text-2xl font-bold text-center mt-10 ${color}`}
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.h2>
);

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const { addToCart } = useCart();

  const [discountProducts, setDiscountProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [guestId, setGuestId] = useState("");
  const userId = useMemo(() => user?.phone || guestId, [user?.phone, guestId]);

  const [activeAd, setActiveAd] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>("");

  const { data: recData, isLoading: loadingRec } = useSWR(
    userId ? `/api/recommendations?userId=${encodeURIComponent(userId)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  // guestId مرة واحدة
  useEffect(() => {
    try {
      const id = localStorage.getItem("guestId");
      if (id) setGuestId(id);
    } catch {}
  }, []);

  // جلب بيانات الصفحة
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const [discountData, newData, adData] = await Promise.all([
          fetch("/api/products/discount", { signal: controller.signal }).then((r) => r.json()),
          fetch("/api/products/new", { signal: controller.signal }).then((r) => r.json()),
          fetch("/api/ads/active", { signal: controller.signal }).then((r) => r.json()),
        ]);

        setDiscountProducts(Array.isArray(discountData) ? discountData : []);
        setNewProducts(Array.isArray(newData) ? newData : []);

        if (adData?.expiresAt) {
          setActiveAd(adData);
        } else {
          setActiveAd(null);
          setCountdown("");
        }
      } catch (e) {
        if ((e as any)?.name === "AbortError") return;
        setDiscountProducts([]);
        setNewProducts([]);
        setActiveAd(null);
        setCountdown("");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  // ✅ عدّ تنازلي بدون Leak + cleanup
  useEffect(() => {
    if (!activeAd?.expiresAt) return;

    const end = new Date(activeAd.expiresAt).getTime();
    if (Number.isNaN(end)) {
      setCountdown("");
      return;
    }

    const tick = () => {
      const ms = end - Date.now();
      setCountdown(formatCountdown(ms));
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [activeAd?.expiresAt]);

  const handleAddToCart = useCallback(
    (product: any) => {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        storeId: product.storeId || product.store?._id || "",
        storeName: product.store?.name || product.storeName || "المتجر",
      });
    },
    [addToCart]
  );

  const goToAdProduct = useCallback(() => {
    const id = activeAd?.product?._id;
    if (!id) return;
    router.push(`/product/${id}`);
  }, [activeAd?.product?._id, router]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <InteractiveNavbar />

      <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-24">
        {activeAd && (
          <motion.div
            className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl p-5 sm:p-6 my-6 shadow-md relative overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {activeAd.title}
                </h2>

                {activeAd.description && (
                  <p className="text-sm sm:text-base mb-2 opacity-95">
                    {activeAd.description}
                  </p>
                )}

                {countdown && (
                  <p className="text-sm font-semibold mb-4">
                    ⏰ {countdown}
                  </p>
                )}

                <button
                  onClick={goToAdProduct}
                  className="bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold shadow hover:bg-gray-100 transition w-full sm:w-auto"
                >
                  اشترِ الآن
                </button>
              </div>

              {activeAd.product?.image && (
                <div className="w-44 h-44 sm:w-48 sm:h-48 relative bg-white rounded-2xl shadow overflow-hidden shrink-0">
                  <Image
                    src={activeAd.product.image}
                    alt={activeAd.product.name || "منتج"}
                    fill
                    sizes="192px"
                    className="object-contain p-3"
                    priority
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        <HeroSection />
        <SeasonalHero />
        <CategoriesSection />
        <PromoBanner />
        <CountdownBanner />
        <DailyDealBanner />

        <SectionTitle>🔥 المنتجات المميزة</SectionTitle>
        <ProductSlider
          products={discountProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
        />

        <SectionTitle color="text-green-700 dark:text-green-400" delay={0.05}>
          🆕 وصل حديثًا
        </SectionTitle>
        <ProductSlider
          products={newProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
        />

        {recData?.recommended?.length > 0 && (
          <motion.section
            className="mt-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-center text-purple-600 mb-6">
              🧠 مقترحات مخصصة لك
            </h3>

            <ProductSlider
              products={recData.recommended}
              loading={loadingRec}
              onAddToCart={handleAddToCart}
            />
          </motion.section>
        )}
      </main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}
