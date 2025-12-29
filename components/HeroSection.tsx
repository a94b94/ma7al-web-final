// components/HeroSection.tsx
"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-b-3xl shadow-lg bg-gradient-to-r from-blue-950 via-blue-900 to-blue-700 text-white">
      {/* خلفية زخرفة خفيفة بدون صور */}
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-300 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          أهلاً بك في <span className="text-white">Ma7al Store</span>
        </h1>

        <p className="mt-4 text-base sm:text-xl text-white/90 max-w-2xl mx-auto">
          استكشف أحدث الإلكترونيات والعروض المميزة من أفضل المحلات.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/categories"
            aria-label="الذهاب إلى صفحة الأقسام"
            className="inline-flex items-center justify-center rounded-full bg-white text-blue-900 font-bold py-3 px-7 shadow hover:bg-gray-100 transition w-full sm:w-auto"
          >
            استعرض الأقسام
          </Link>

          <Link
            href="/"
            aria-label="عرض أحدث المنتجات"
            className="inline-flex items-center justify-center rounded-full bg-white/10 text-white font-semibold py-3 px-7 border border-white/20 hover:bg-white/15 transition w-full sm:w-auto"
          >
            أحدث المنتجات
          </Link>
        </div>

        {/* شريط مزايا سريع (اختياري لكنه يعطي شكل حديث) */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <div className="font-bold">أسعار منافسة</div>
            <div className="text-sm text-white/80 mt-1">عروض تتحدث باستمرار</div>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <div className="font-bold">محلات متعددة</div>
            <div className="text-sm text-white/80 mt-1">اختَر المحل الأقرب</div>
          </div>
          <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
            <div className="font-bold">تجربة سريعة</div>
            <div className="text-sm text-white/80 mt-1">تحميل أخف + أداء أعلى</div>
          </div>
        </div>
      </div>
    </section>
  );
}
