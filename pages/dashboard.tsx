"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }

    setTimeout(() => {
      setLoading(false);
    }, 300); // ⏳ محاكاة فحص سريع
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
        <p className="text-lg animate-pulse">🔄 جاري التحقق من تسجيل الدخول...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-800 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-3xl mx-auto">
        <motion.h1
          className="text-3xl font-bold mb-4 text-blue-700 dark:text-blue-400"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          📊 لوحة التحكم
        </motion.h1>

        <motion.p
          className="text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          مرحبًا بك! تم تسجيل دخولك بنجاح 🔐
        </motion.p>
      </div>
    </motion.div>
  );
}
