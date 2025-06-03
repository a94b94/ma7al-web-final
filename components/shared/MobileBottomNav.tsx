"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingCart, Heart, User, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { cart } = useCart();
  const [favCount, setFavCount] = useState(0);

  // ✅ عداد السلة
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ جلب الإشعارات غير المقروءة
  const fetcher = (url: string) => fetch(url).then((res) => res.json());
  const { data: notifData } = useSWR(
    user?.phone ? `/api/notifications/user?phone=${user.phone}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );
  const unreadCount = notifData?.notifications?.filter((n: any) => !n.seen)?.length || 0;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavCount(saved.length);
  }, [pathname]);

  const handleClick = (href: string) => {
    if (window?.navigator.vibrate) window.navigator.vibrate(15);
    router.push(href);
  };

  const navItems = [
    { label: "الرئيسية", icon: Home, href: "/" },
    {
      label: "السلة",
      icon: ShoppingCart,
      href: "/cart",
      badge: cartCount,
    },
    {
      label: "المفضلة",
      icon: Heart,
      href: "/favorites",
      badge: favCount,
    },
    {
      label: "تنبيهات",
      icon: Bell,
      href: "/notifications",
      badge: unreadCount,
    },
    {
      label: user ? user.name.split(" ")[0] : "حسابي",
      icon: user?.image ? null : User,
      href: user ? "/profile" : "/login",
      avatar: user?.image,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t shadow sm:hidden backdrop-blur">
      <div className="flex justify-around items-center h-16 relative">
        {navItems.map((item) => {
          const safePath = pathname ?? "";
          const isActive =
            safePath === item.href || safePath.startsWith(item.href + "/");

          return (
            <div key={item.href} className="relative flex flex-col items-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => handleClick(item.href)}
                className={`relative flex flex-col items-center text-[11px] transition-all ${
                  isActive
                    ? "text-blue-600 font-bold"
                    : "text-gray-500 dark:text-gray-300"
                }`}
              >
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover shadow"
                  />
                ) : item.icon ? (
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                ) : null}

                {(item.badge ?? 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}

                <span className="mt-1">{item.label}</span>
              </motion.button>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="active-underline"
                    className="absolute -bottom-1 h-[3px] w-6 rounded-full bg-blue-600"
                    initial={{ opacity: 0, scaleX: 0.5 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.5 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
