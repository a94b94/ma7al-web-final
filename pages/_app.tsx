import "@/styles/print.css";
import "../styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import type { AppProps } from "next/app";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/context/UserContext";
import MobileBottomNav from "@/components/shared/MobileBottomNav";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>

      <UserProvider>
        <CartProvider>
          <Toaster position="top-right" />

          <div className="pb-24">
            <Component {...pageProps} />
          </div>

          <MobileBottomNav />
        </CartProvider>
      </UserProvider>
    </>
  );
}
