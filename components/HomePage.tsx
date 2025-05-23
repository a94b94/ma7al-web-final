"use client";

import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import CategoriesSection from "@/components/CategoriesSection";
import ProductSlider from "@/components/ProductSlider";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import useSWR from "swr";

export default function HomePage() {
  const { user, logout } = useUser();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [discountProducts, setDiscountProducts] = useState<any[]>([]);
  const [newProducts, setNewProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data: notifData } = useSWR(
    user?.phone ? `/api/notifications/user?phone=${user.phone}` : null,
    fetcher
  );
  const unreadCount = notifData?.notifications?.filter((n: any) => !n.seen)?.length || 0;

  const guestId = typeof window !== "undefined" ? localStorage.getItem("guestId") : "";
  const { data: recData } = useSWR(
    user?.phone || guestId ? `/api/recommendations?userId=${user?.phone || guestId}` : null,
    fetcher
  );

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="bg-white dark:bg-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          <a href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Ma7al Store
          </a>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            <a href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                  {cart.length}
                </span>
              )}
            </a>

            {user && (
              <a href="/notifications" className="relative">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </a>
            )}

            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1">
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 rounded shadow-lg text-sm z-50">
                    <a href="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">لوحة التحكم</a>
                    <button onClick={handleLogout} className="w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">تسجيل خروج</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">دخول</a>
                <a href="/register" className="text-green-600 dark:text-green-400 hover:underline">تسجيل</a>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden bg-white dark:bg-gray-800 px-4 py-2">
            <a href="/" className="block py-1">الرئيسية</a>
            <a href="/cart" className="block py-1">السلة</a>
            {user ? (
              <>
                <a href="/notifications" className="block py-1">الإشعارات</a>
                <a href="/admin" className="block py-1">لوحة التحكم</a>
                <button onClick={handleLogout} className="w-full text-right py-1">تسجيل خروج</button>
              </>
            ) : (
              <>
                <a href="/login" className="block py-1">دخول</a>
                <a href="/register" className="block py-1">تسجيل</a>
              </>
            )}
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4">
        <HeroSection />
        <CategoriesSection />

        <motion.h2 className="text-2xl font-bold text-center mt-10 text-indigo-700 dark:text-indigo-400" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          🔥 المنتجات المميزة
        </motion.h2>
        <ProductSlider products={discountProducts} loading={loading} />

        <motion.h2 className="text-2xl font-bold text-center mt-10 text-green-700 dark:text-green-400" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          🆕 وصل حديثًا
        </motion.h2>
        <ProductSlider products={newProducts} loading={loading} />

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
            <ProductSlider products={recData.recommended} />
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
