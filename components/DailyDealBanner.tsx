// components/DailyDealBanner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

type Deal = { text: string; link: string };

const deals: Deal[] = [
  { text: "📱 خصم 20% على موبايلات مختارة", link: "/category/mobiles" },
  { text: "💻 خصم 15% على لابتوبات اليوم فقط", link: "/category/laptops" },
  { text: "🎧 سماعات بسعر خاص اليوم!", link: "/category/headphones" },
  { text: "⌚️ عروض على الساعات الذكية", link: "/category/watches" },
];

// مفتاح يومي ثابت (حسب الجهاز) لتغيير العرض يوميًا
function getDailyKey() {
  const now = new Date();
  // YYYY-MM-DD (محلي)
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ينتج رقم ثابت من سترنغ (hash بسيط)
function hashToIndex(input: string, modulo: number) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return modulo ? h % modulo : 0;
}

export default function DailyDealBanner() {
  const [dailyKey, setDailyKey] = useState<string>(() => getDailyKey());

  // ✅ يتحدث بعد منتصف الليل حتى لو الصفحة مفتوحة
  useEffect(() => {
    const tick = () => {
      const nextKey = getDailyKey();
      setDailyKey((prev) => (prev === nextKey ? prev : nextKey));
    };

    // تحقق كل دقيقة (خفيف جدًا)
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  const deal = useMemo(() => {
    const idx = hashToIndex(dailyKey, deals.length);
    return deals[idx];
  }, [dailyKey]);

  return (
    <motion.div
      className="bg-yellow-400 text-black rounded-xl px-6 py-4 my-6 flex justify-between items-center flex-wrap gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="status"
      aria-live="polite"
    >
      <p className="font-bold text-lg">{deal.text}</p>

      <Link
        href={deal.link}
        className="text-blue-900 font-semibold underline underline-offset-4 hover:opacity-90 transition"
        aria-label="استعرض عرض اليوم"
      >
        استعرض الآن
      </Link>
    </motion.div>
  );
}
