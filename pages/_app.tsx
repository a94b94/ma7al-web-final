import "../styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import type { AppProps } from "next/app";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/context/UserContext";
import MobileBottomNav from "@/components/shared/MobileBottomNav"; // ✅ الاستيراد

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <CartProvider>
        <Toaster position="top-right" />
        
        {/* ✅ المحتوى مع مساحة سفلية لعدم تغطيته من الشريط */}
        <div className="pb-24">
          <Component {...pageProps} />
        </div>

        {/* ✅ شريط التنقل السفلي يظهر فقط على الموبايل */}
        <MobileBottomNav />
      </CartProvider>
    </UserProvider>
  );
}
