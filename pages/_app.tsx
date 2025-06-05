// pages/_app.tsx
import "../styles/globals.css";          // 1. قاعدة Tailwind والأنماط العامة
import "@/styles/print.css";             // 2. تنسيقات الطباعة
import "slick-carousel/slick/slick.css"; // 3. Slick Slider
import "slick-carousel/slick/slick-theme.css";

import Head from "next/head";
import type { AppProps } from "next/app";
import { UserProvider } from "@/context/UserContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function MyAppWrapper({ Component, pageProps }: AppProps) {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(true);

  useEffect(() => {
    // 🔒 لا نعرض شريط التنقل السفلي داخل لوحة التحكم
    setShowNav(!pathname?.startsWith("/admin"));
  }, [pathname]);

  return (
    <>
      {/* -------- 1. إعدادات <head> العامة -------- */}
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <title>Ma7al Store</title>
      </Head>

      {/* -------- 2. تغليف بالسياقات -------- */}
      <UserProvider>
        <CartProvider>
          {/* تنبيهات فورية */}
          <Toaster position="top-right" />

          {/* -------- 3. محتوى الصفحة -------- */}
          <div className="pb-24 print:pb-0">
            <Component {...pageProps} />
          </div>

          {/* -------- 4. شريط التنقل السفلي للهاتف -------- */}
          {showNav && <div className="print:hidden"><MobileBottomNav /></div>}
        </CartProvider>
      </UserProvider>
    </>
  );
}

export default MyAppWrapper;
