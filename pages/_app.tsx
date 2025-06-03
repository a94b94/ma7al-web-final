// pages/_app.tsx
import "../styles/globals.css";     // أولًا: قواعد Tailwind والـ CSS العامّة
import "@/styles/print.css";        // ثانيًا: تنسيقات الطباعة
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Head from "next/head";
import type { AppProps } from "next/app";
import { UserProvider } from "@/context/UserContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import MobileBottomNav from "@/components/shared/MobileBottomNav";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* -------- 1. إعدادات <head> العامّة -------- */}
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

      {/* -------- 2. التغليف بـ Providers (سياقات) -------- */}
      <UserProvider>
        <CartProvider>
          {/* Toaster لإظهار التنبيهات القصيرة */}
          <Toaster position="top-right" />

          {/* -------- 3. المحتوى الرئيسي للصفحة -------- */}
          <div className="pb-24">
            <Component {...pageProps} />
          </div>

          {/* -------- 4. شريط التنقل السفلي (للهواتف الصغيرة) -------- */}
          <MobileBottomNav />
        </CartProvider>
      </UserProvider>
    </>
  );
}
