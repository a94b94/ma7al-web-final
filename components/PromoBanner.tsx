// components/PromoBanner.tsx
"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PromoBanner() {
  return (
    <motion.div
      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md px-6 py-4 my-10 flex items-center justify-between flex-wrap gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 text-lg font-semibold">
        <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
        <span>⚡ عروض حصرية: خصم حتى 30% على الأجهزة الكهربائية!</span>
      </div>
      <Link
        href="/category/electronics"
        className="bg-white text-purple-700 px-4 py-2 rounded-full font-bold hover:bg-purple-100 transition"
      >
        استعرض الآن
      </Link>
    </motion.div>
  );
}
