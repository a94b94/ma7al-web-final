"use client";

import "../styles/globals.css";
import "@/styles/print.css";
import "slick-carousel/slick/slick.css";
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

  // ✅ تفعيل الوضع الليلي تلقائيًا حسب تفضيلات النظام
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    setShowNav(!(pathname?.startsWith("/admin") || pathname?.includes("/print")));
  }, [pathname]);

  return (
    <>
      {/* -------- 1. إعدادات <head> العامة -------- */}
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <title>Ma7al Store</title>
      </Head>

      {/* -------- 2. تغليف بالسياقات -------- */}
      <UserProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <div className="pb-24 print:pb-0 bg-white dark:bg-gray-950 transition-colors duration-300">
            <Component {...pageProps} />
          </div>
          {showNav && (
            <div className="print:hidden">
              <MobileBottomNav />
            </div>
          )}
        </CartProvider>
      </UserProvider>
    </>
  );
}

export default MyAppWrapper;
