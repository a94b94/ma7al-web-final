// components/shared/Navbar.tsx
"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { ShoppingCart, Menu, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">
          Ma7al Store
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="hover:text-blue-600">الرئيسية</Link>
          <Link href="/categories" className="hover:text-blue-600">الأقسام</Link>
          <Link href="/cart" className="hover:text-blue-600 flex items-center gap-1">
            <ShoppingCart size={18} />
            السلة
          </Link>
          {user ? (
            <Link href="/admin" className="text-blue-600 font-semibold">
              {user.name}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-blue-600">
              تسجيل الدخول
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Menu onClick={() => setOpen(!open)} />
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden mt-2 flex flex-col space-y-2 px-4">
          <Link href="/" className="hover:text-blue-600">الرئيسية</Link>
          <Link href="/categories" className="hover:text-blue-600">الأقسام</Link>
          <Link href="/cart" className="hover:text-blue-600">السلة</Link>
          {user ? (
            <Link href="/admin" className="text-blue-600 font-semibold">
              {user.name}
            </Link>
          ) : (
            <Link href="/login" className="hover:text-blue-600">
              تسجيل الدخول
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
