"use client";

import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import CategoriesSection from "@/components/CategoriesSection";
import ProductSlider from "@/components/ProductSlider";
import { useEffect, useState } from "react";
import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Globe,
  ShoppingCart,
  User,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";

const categories = [
  { name: "هواتف", icon: Smartphone, href: "/category/mobiles" },
  { name: "لابتوبات", icon: Laptop, href: "/category/laptops" },
  { name: "سماعات", icon: Headphones, href: "/category/headphones" },
  { name: "ساعات", icon: Watch, href: "/category/watches" },
  { name: "أجهزة إنترنت", icon: Globe, href: "/category/internet-devices" },
];

export default function HomePage() {
  const { user, logout } = useUser();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [discountProducts, setDiscountProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    fetch("/api/products/discount")
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? setDiscountProducts(data) : setDiscountProducts([])))
      .catch(() => setDiscountProducts([]));

    fetch("/api/products/new")
      .then((res) => res.json())
      .then((data) => (Array.isArray(data) ? setNewProducts(data) : setNewProducts([])))
      .catch(() => setNewProducts([]))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pb-24">
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        {/* header content as before */}
      </header>

      <main>
        <HeroSection />
        <CategoriesSection />

        <motion.h2
          className="text-2xl font-bold text-center my-6 text-indigo-700 dark:text-indigo-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🔥 المنتجات المميزة
        </motion.h2>
        <ProductSlider products={discountProducts} loading={loading} />

        <motion.h2
          className="text-2xl font-bold text-center my-6 text-green-700 dark:text-green-400"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          🆕 وصل حديثًا
        </motion.h2>
        <ProductSlider products={newProducts} loading={loading} />
      </main>

      <Footer />
      <p className="text-center mt-8 text-sm font-semibold text-indigo-700 dark:text-indigo-400 animate-pulse tracking-wide">
        جميع الحقوق محفوظة © <span className="underline decoration-dotted">ابن ال تميم</span>
        <span className="inline-block ml-2 text-xs text-gray-500 dark:text-gray-300 italic">— توقيع رقمي</span>
      </p>
    </div>
  );
}
