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
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import useSWR from "swr";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SectionTitle = ({
  children,
  color = "text-indigo-700 dark:text-indigo-400",
  delay = 0,
}: {
  children: React.ReactNode;
  color?: string;
  delay?: number;
}) => (
  <motion.h2
    className={`text-2xl font-bold text-center mt-10 ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    {children}
  </motion.h2>
);

export default function HomePage() {
  const { user } = useUser();
  const { cart = [], addToCart } = useCart();

  const [discountProducts, setDiscountProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState("");
  const [activeAd, setActiveAd] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>("");

  const { data: recData, isLoading: loadingRec } = useSWR(
    user?.phone || guestId ? `/api/recommendations?userId=${user?.phone || guestId}` : null,
    fetcher
  );

  useEffect(() => {
    const id = localStorage.getItem("guestId");
    if (id) setGuestId(id);

    Promise.all([
      fetch("/api/products/discount").then((res) => res.json()),
      fetch("/api/products/new").then((res) => res.json()),
      fetch("/api/ads/active").then((res) => res.json()),
    ])
      .then(([discountData, newData, adData]) => {
        setDiscountProducts(Array.isArray(discountData) ? discountData : []);
        setNewProducts(Array.isArray(newData) ? newData : []);
        if (adData?.expiresAt) {
          setActiveAd(adData);
          updateCountdown(adData.expiresAt);
        }
      })
      .catch(() => {
        setDiscountProducts([]);
        setNewProducts([]);
        setActiveAd(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateCountdown = (endTime: string) => {
    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      const distance = end - now;

      if (distance <= 0) {
        clearInterval(interval);
        setCountdown("انتهى العرض");
        return;
      }

      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setCountdown(`${hours} س ${minutes} د ${seconds} ث`);
    }, 1000);
  };

 const handleAddToCart = useCallback(
  (product: any) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeId: product.storeId || product.store?._id || "", // حسب مصدر البيانات
      storeName: product.store?.name || "المتجر", // الأفضل أن تأتي من API
    });
  },
  [addToCart]
);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <InteractiveNavbar />
      <main className="max-w-7xl mx-auto px-2 sm:px-4 pb-24">
        {activeAd && (
          <motion.div
            className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg p-6 my-6 shadow-md relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{activeAd.title}</h2>
                <p className="text-sm mb-2">{activeAd.description}</p>
                <p className="text-sm font-semibold mb-4">⏰ {countdown}</p>
                <button
                  onClick={() => window.location.href = `/product/${activeAd.product._id}`}
                  className="bg-white text-blue-600 px-4 py-2 rounded font-semibold shadow hover:bg-gray-100"
                >
                  اشترِ الآن 🛒
                </button>
              </div>
              {activeAd.product?.image && (
                <img
                  src={activeAd.product.image}
                  alt={activeAd.product.name}
                  className="w-48 h-48 object-contain bg-white rounded-lg shadow"
                />
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
        <ProductSlider products={discountProducts} loading={loading} onAddToCart={handleAddToCart} />

        <SectionTitle color="text-green-700 dark:text-green-400" delay={0.2}>
          🆕 وصل حديثًا
        </SectionTitle>
        <ProductSlider products={newProducts} loading={loading} onAddToCart={handleAddToCart} />

        {recData?.recommended?.length > 0 && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
          </motion.div>
        )}
      </main>
      <MobileBottomNav />
      <Footer />
    </div>
  );
}
