// components/HeroSection.tsx
"use client";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-600 text-white py-20 px-4 text-center rounded-b-3xl shadow-lg">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">أهلاً بك في Ma7al Store 👋</h1>
      <p className="text-lg sm:text-xl mb-6">استكشف أحدث الإلكترونيات والعروض المميزة من أفضل المحلات</p>
      <Link
        href="/categories"
        className="bg-white text-blue-800 font-bold py-3 px-6 rounded-full shadow hover:bg-gray-100 transition"
      >
        استعرض الأقسام
      </Link>
    </section>
  );
}
