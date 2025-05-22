import "../styles/globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Ma7al Store",
  description: "متجر إلكترونيات متكامل",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  );
}
