"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 sm:px-8 lg:px-16 overflow-hidden">
      {/* نقش إلكتروني شفاف */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <Image
          src="/images/tech-pattern.svg"
          alt="background pattern"
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-4 text-pink-500"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          أهلاً بك في <span className="text-white">Ma7al Store</span>
        </motion.h1>

        <motion.p
          className="text-gray-300 text-base sm:text-lg md:text-xl mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          اكتشف أحدث الإلكترونيات 🧠 والعروض الحصرية مباشرة من أفضل المحلات
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link
            href="/categories"
            aria-label="استعرض الأقسام المتوفرة"
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition"
          >
            استعرض الأقسام
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
