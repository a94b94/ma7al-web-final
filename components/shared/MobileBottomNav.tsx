"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ShoppingCart,
  Heart,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { cart } = useCart();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { label: "الرئيسية", icon: Home, href: "/" },
    {
      label: "السلة",
      icon: ShoppingCart,
      href: "/cart",
      badge: cartCount,
    },
    { label: "المفضلة", icon: Heart, href: "/favorites" },
    {
      label: user ? user.name.split(" ")[0] : "حسابي",
      icon: user?.image ? null : User,
      href: user ? "/profile" : "/login",
      avatar: user?.image,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow sm:hidden">
      <div className="flex justify-around items-center h-16 relative">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <div key={item.href} className="relative flex flex-col items-center">
              <button
                onClick={() => router.push(item.href)}
                className={`relative flex flex-col items-center text-xs transition-all duration-150 ${
                  isActive ? "text-blue-600 font-semibold" : "text-gray-500"
                }`}
              >
                {/* أيقونة أو صورة */}
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt="avatar"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : item.icon ? (
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                ) : null}

                {/* عدد المنتجات في السلة */}
                {item.label === "السلة" && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}

                <span className="mt-0.5">{item.label}</span>
              </button>

              {/* خط متحرك للأيقونة النشطة */}
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
