// components/SeasonalHero.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function SeasonalHero() {
  return (
    <motion.div
      className="relative bg-[url('/hero-sale.jpg')] bg-cover bg-center rounded-2xl overflow-hidden my-8 h-60 sm:h-72 md:h-96 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="bg-black bg-opacity-50 w-full h-full flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow">
          🎉 عروض الصيف الكبرى
        </h2>
        <Link href="/category/electronics" className="bg-white text-blue-700 px-6 py-2 rounded-full font-bold hover:bg-blue-100">
          تسوق الآن
        </Link>
      </div>
    </motion.div>
  );
}
