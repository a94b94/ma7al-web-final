// components/shared/InteractiveNavbar.tsx
"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import {
  Bell,
  Menu,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function InteractiveNavbar() {
  const { user, logout } = useUser();
  const { cart = [] } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("العربية");

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: notifData } = useSWR(
    user?.phone ? `/api/notifications/user?phone=${user.phone}` : null,
    fetcher
  );
  const unreadCount = notifData?.notifications?.filter((n: any) => !n.seen)?.length || 0;

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = theme === "dark" || (!theme && prefersDark);
    setDarkMode(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <header className="bg-white dark:bg-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          Ma7al Store
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            {searchOpen ? (
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm w-64"
              />
            ) : (
              <button onClick={() => setSearchOpen(true)}>
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>

          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white"
          >
            <option>العربية</option>
            <option>English</option>
          </select>

          <Link href="/notifications" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </Link>

          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                {cart.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1">
                <User className="w-5 h-5" />
                <span>{user.name}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white dark:bg-gray-700 rounded shadow-lg text-sm z-50">
                  <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">لوحة التحكم</Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    تسجيل خروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">دخول</Link>
              <Link href="/register" className="text-green-600 dark:text-green-400 hover:underline">تسجيل</Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
}
