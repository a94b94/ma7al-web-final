// components/CountdownBanner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const COUNTDOWN_KEY = "ma7al_countdown_end_v1";
const DURATION_MS = 6 * 60 * 60 * 1000; // 6 ساعات

function formatTime(ms: number) {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function getOrCreateTargetTime(): number {
  try {
    const existing = localStorage.getItem(COUNTDOWN_KEY);
    const n = existing ? Number(existing) : NaN;

    // إذا موجود وصالح ولسه بالمستقبل
    if (Number.isFinite(n) && n > Date.now()) return n;

    // غير صالح أو انتهى → اصنع جديد
    const fresh = Date.now() + DURATION_MS;
    localStorage.setItem(COUNTDOWN_KEY, String(fresh));
    return fresh;
  } catch {
    // إذا localStorage غير متاح لأي سبب
    return Date.now() + DURATION_MS;
  }
}

export default function CountdownBanner() {
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // تهيئة الهدف بعد mount فقط (حتى ما يصير mismatch)
  useEffect(() => {
    const t = getOrCreateTargetTime();
    setTargetTime(t);
    setTimeLeft(Math.max(0, t - Date.now()));
  }, []);

  useEffect(() => {
    if (!targetTime) return;

    const interval = setInterval(() => {
      const left = Math.max(0, targetTime - Date.now());
      setTimeLeft(left);

      // وقف المؤقت عند الانتهاء
      if (left <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const label = useMemo(() => {
    if (!targetTime) return "⏳ جاري التحميل...";
    if (timeLeft <= 0) return "✅ انتهى العرض الخاص";
    return `⏳ العرض الخاص ينتهي خلال: ${formatTime(timeLeft)}`;
  }, [targetTime, timeLeft]);

  return (
    <motion.div
      className="bg-red-600 text-white rounded-xl shadow-md px-6 py-4 my-6 text-center font-bold text-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="status"
      aria-live="polite"
    >
      {label}
    </motion.div>
  );
}
