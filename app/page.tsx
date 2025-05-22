// مثال في _app.tsx
import { CartProvider } from "@/context/CartContext";

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}
