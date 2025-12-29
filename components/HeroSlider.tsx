"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.5,
        ease: "easeOut",
        staggerChildren: reduceMotion ? 0 : 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0 : 0.45, ease: "easeOut" } },
  };

  return (
    <header
      dir="rtl"
      className="relative overflow-hidden text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
      aria-label="الواجهة الرئيسية"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-30 bg-gradient-to-tr from-pink-500 via-indigo-500 to-cyan-400" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.10),rgba(0,0,0,0))]" />

      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.h1
            variants={item}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
          >
            مرحبًا بك في{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-pink-400 to-fuchsia-500">
              Ma7al Store
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-4 text-base sm:text-lg md:text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto"
          >
            اكتشف أفضل الإلكترونيات بأحدث العروض والأسعار من المحلات القريبة منك، مع تجربة سريعة وسلة شراء سهلة.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Link
              href="/categories"
              aria-label="الذهاب إلى الأقسام"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold shadow-lg
                         bg-pink-600 hover:bg-pink-700 transition
                         focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 focus:ring-offset-slate-950"
              prefetch
            >
              استعرض الأقسام
            </Link>

            <Link
              href="/"
              aria-label="مشاهدة أحدث المنتجات"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 font-semibold
                         bg-white/10 hover:bg-white/15 border border-white/15 transition
                         focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-slate-950"
              prefetch
            >
              أحدث المنتجات
            </Link>
          </motion.div>

          <motion.div variants={item} className="mt-6 text-xs sm:text-sm text-slate-300/90">
            شحن سريع داخل المدينة • دعم المحلات المتعددة • عروض يومية
          </motion.div>
        </motion.div>
      </div>
    </header>
  );
}
