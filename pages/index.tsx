"use client";

import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
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
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <a href="/" className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
            Ma7al Store
          </a>

          <div className="hidden md:flex items-center gap-4 flex-row-reverse">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="hover:text-indigo-600 dark:hover:text-yellow-400 transition"
              title={darkMode ? "الوضع الفاتح" : "الوضع الداكن"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <a href="/cart" className="relative hover:text-indigo-600 dark:hover:text-indigo-300">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                  {cart.length}
                </span>
              )}
            </a>

            {user ? (
              <div className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1">
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 border rounded shadow-lg text-sm z-50">
                    <a
                      href="/admin"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      لوحة التحكم
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      تسجيل خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                  تسجيل الدخول
                </a>
                <a href="/register" className="text-green-600 dark:text-green-400 hover:underline">
                  تسجيل جديد
                </a>
              </div>
            )}
          </div>

          <button className="md:hidden text-gray-700 dark:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden bg-white dark:bg-gray-800 border-t text-sm text-gray-800 dark:text-white">
            <a href="/" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">الرئيسية</a>
            <a href="/categories" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">الأقسام</a>
            <a href="/cart" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">السلة</a>
            {user ? (
              <>
                <a href="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">لوحة التحكم</a>
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  تسجيل خروج
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">تسجيل الدخول</a>
                <a href="/register" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">تسجيل جديد</a>
              </>
            )}
          </nav>
        )}
      </header>

      <main>
        <HeroSection />
        {/* باقي الصفحة كما كانت */}
      </main>

      <Footer />
    </div>
  );
}
