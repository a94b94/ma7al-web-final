// components/CountdownBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const targetTime = new Date().getTime() + 6 * 60 * 60 * 1000; // 6 ساعات من الآن

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(targetTime - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="bg-red-600 text-white rounded-xl shadow-md px-6 py-4 my-6 text-center font-bold text-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      ⏳ العرض الخاص ينتهي خلال: {formatTime(timeLeft)}
    </motion.div>
  );
}
