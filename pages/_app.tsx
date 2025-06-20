"use client";

import "../styles/globals.css";
import "@/styles/print.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Head from "next/head";
import type { AppProps } from "next/app";
import { UserProvider } from "@/context/UserContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster, toast } from "react-hot-toast";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

// ✅ أدوات الفواتير المؤجلة
import {
  getAllPendingInvoices,
  clearPendingInvoices,
  getAllPendingPurchaseInvoices,
  clearPendingPurchaseInvoices,
} from "@/lib/db/offlineStore";

function MyAppWrapper({ Component, pageProps }: AppProps) {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(true);

  // ✅ الوضع الليلي
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  // ✅ إخفاء شريط التنقل السفلي
  useEffect(() => {
    const hidden = pathname?.startsWith("/admin") || pathname?.includes("/print");
    setShowNav(!hidden);
  }, [pathname]);

  // ✅ تسجيل Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ Service Worker مسجل"))
        .catch((err) => console.error("❌ فشل التسجيل", err));
    }
  }, []);

  // ✅ مزامنة الفواتير عند رجوع الإنترنت
  useEffect(() => {
    const syncOfflineData = async () => {
      let synced = 0;

      // 🧾 فواتير البيع
      const invoices = await getAllPendingInvoices();
      for (const invoice of invoices) {
        try {
          await axios.post("/api/invoices/add", invoice);
          synced++;
        } catch (err) {
          console.error("❌ فشل مزامنة فاتورة بيع:", err);
        }
      }
      if (invoices.length > 0) await clearPendingInvoices();

      // 📦 فواتير الشراء
      const purchases = await getAllPendingPurchaseInvoices();
      for (const purchase of purchases) {
        try {
          await axios.post("/api/purchase-invoice/add", purchase);
          synced++;
        } catch (err) {
          console.error("❌ فشل مزامنة فاتورة شراء:", err);
        }
      }
      if (purchases.length > 0) await clearPendingPurchaseInvoices();

      if (synced > 0) toast.success(`✅ تمت مزامنة ${synced} فاتورة بنجاح!`);
    };

    window.addEventListener("online", syncOfflineData);
    syncOfflineData();

    return () => window.removeEventListener("online", syncOfflineData);
  }, []);

  return (
    <>
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

      <UserProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <main className="min-h-screen pb-24 print:pb-0 bg-white dark:bg-gray-950 transition-colors duration-300">
            <Component {...pageProps} />
          </main>
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
