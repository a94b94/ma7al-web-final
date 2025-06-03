// InteractiveNavbar.tsx — كامل مع كل الميزات:
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
import useSWR, { mutate } from "swr";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function InteractiveNavbar() {
  const { user, logout } = useUser();
  const { cart = [] } = useCart();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedLang, setSelectedLang] = useState("العربية");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: notifData } = useSWR(
    user?.phone ? `/api/notifications/user?phone=${user.phone}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );
  const unreadCount = notifData?.notifications?.filter((n: any) => !n.seen)?.length || 0;
  const recentNotifications = notifData?.notifications?.slice(0, 5) || [];

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

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(saved);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/search?q=${searchQuery}`);
        const data = await res.json();
        setSearchResults(data.products || []);
      } catch {
        setSearchResults([]);
      }
    };
    const delay = setTimeout(fetchResults, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleSelect = (id: string, name?: string) => {
    if (name) {
      const updated = [name, ...searchHistory.filter((n) => n !== name)].slice(0, 5);
      setSearchHistory(updated);
      localStorage.setItem("searchHistory", JSON.stringify(updated));
    }
    router.push(`/product/${id}`);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch("/api/notifications/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      mutate(`/api/notifications/user?phone=${user?.phone}`);
    } catch {
      toast.error("❌ فشل حذف الإشعار");
    }
  };

  const clearAllNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/clear-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user?.phone }),
      });
      if (res.ok) {
        toast.success("🧹 تم مسح جميع الإشعارات");
        mutate(`/api/notifications/user?phone=${user?.phone}`);
      } else {
        throw new Error();
      }
    } catch {
      toast.error("❌ فشل مسح الإشعارات");
    }
  };

  const markAllAsSeen = async () => {
    try {
      await fetch("/api/notifications/mark-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user?.phone }),
      });
      mutate(`/api/notifications/user?phone=${user?.phone}`);
    } catch {
      console.error("فشل تحديث حالة الإشعارات");
    }
  };

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
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
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
          <div
            className="relative"
            onMouseEnter={() => {
              setNotifMenuOpen(true);
              markAllAsSeen();
            }}
            onMouseLeave={() => setNotifMenuOpen(false)}
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300 cursor-pointer" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border rounded shadow z-50">
                <ul className="max-h-60 overflow-y-auto">
                  {recentNotifications.map((notif: any) => (
                    <li key={notif._id} className="flex justify-between items-center px-3 py-2 border-b text-sm">
                      <span>{notif.message}</span>
                      <button
                        onClick={() => deleteNotification(notif._id)}
                        className="text-red-500 text-xs hover:underline"
                      >
                        حذف
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={clearAllNotifications}
                  className="block w-full text-center py-2 text-red-500 hover:underline border-t"
                >
                  🧹 مسح جميع الإشعارات
                </button>
              </div>
            )}
          </div>
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                {cart.length}
              </span>
            )}
          </Link>
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-1 focus:outline-none">
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content
                className="bg-white dark:bg-gray-700 shadow-lg rounded-md text-sm py-1 z-50"
                sideOffset={8}
                align="end"
              >
                <DropdownMenu.Item asChild>
                  <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600">
                    لوحة التحكم
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => logout()}
                  className="px-4 py-2 text-right hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                >
                  تسجيل خروج
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">دخول</Link>
              <Link href="/register" className="text-green-600 dark:text-green-400 hover:underline">تسجيل</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
