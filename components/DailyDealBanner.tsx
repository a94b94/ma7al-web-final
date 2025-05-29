// components/DailyDealBanner.tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const deals = [
  { text: "📱 خصم 20% على موبايلات مختارة", link: "/category/mobiles" },
  { text: "💻 خصم 15% على لابتوبات اليوم فقط", link: "/category/laptops" },
  { text: "🎧 سماعات بسعر خاص اليوم!", link: "/category/headphones" },
  { text: "⌚️ عروض على الساعات الذكية", link: "/category/watches" },
];

export default function DailyDealBanner() {
  const index = useMemo(() => new Date().getDay() % deals.length, []);
  const deal = deals[index];

  return (
    <motion.div
      className="bg-yellow-400 text-black rounded-xl px-6 py-4 my-6 flex justify-between items-center flex-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="font-bold text-lg">{deal.text}</p>
      <Link href={deal.link} className="text-blue-800 font-semibold underline">استعرض الآن</Link>
    </motion.div>
  );
}
