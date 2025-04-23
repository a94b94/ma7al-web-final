import "../styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import type { AppProps } from "next/app";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/context/UserContext";  // ✅ نلفّ التطبيق بالسياق

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <CartProvider>
        <Toaster position="top-right" />
        <Component {...pageProps} />
      </CartProvider>
    </UserProvider>
  );
}
