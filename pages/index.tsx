"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import useSWR from "swr";
import { motion } from "framer-motion";
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

export default function HomePage() {
  const { user } = useUser();
  const { cart = [], addToCart } = useCart();

  const [discountProducts, setDiscountProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [guestId, setGuestId] = useState("");

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: recData, isLoading: loadingRec } = useSWR(
    typeof window !== "undefined" && (user?.phone || guestId)
      ? `/api/recommendations?userId=${user?.phone || guestId}`
      : null,
    fetcher
  );

  useEffect(() => {
    const id = localStorage.getItem("guestId");
    if (id) setGuestId(id);

    Promise.all([
      fetch("/api/products/discount").then((res) => res.json()),
      fetch("/api/products/new").then((res) => res.json()),
    ])
      .then(([discountData, newData]) => {
        setDiscountProducts(Array.isArray(discountData) ? discountData : []);
        setNewProducts(Array.isArray(newData) ? newData : []);
      })
      .catch(() => {
        setDiscountProducts([]);
        setNewProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <InteractiveNavbar />

      <motion.main
        className="max-w-7xl mx-auto px-2 sm:px-4 pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          🔥 المنتجات المميزة
        </motion.h2>
        <ProductSlider
          key="discount"
          products={discountProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
        />

        {/* 🆕 جديد */}
        <motion.h2
          className="text-2xl font-bold text-center mt-10 text-green-700 dark:text-green-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          🆕 وصل حديثًا
        </motion.h2>
        <ProductSlider
          key="new"
          products={newProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
        />

        {/* 🤖 مقترحات */}
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
              key="recommendations"
              products={recData.recommended}
              loading={loadingRec}
              onAddToCart={handleAddToCart}
            />
          </motion.div>
        )}
      </motion.main>

      <MobileBottomNav />
      <Footer />
    </div>
  );
}
