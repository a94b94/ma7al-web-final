// app/layout.tsx
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({ children }) {
  return (
    <html lang="ar">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
