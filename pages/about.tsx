"use client";

import Head from "next/head";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-gray-800 dark:text-gray-200">
      <Head>
        <title>من نحن - Ma7al Store</title>
        <meta name="description" content="تعرف على Ma7al Store - وجهتك المفضلة للإلكترونيات في العراق." />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold mb-4 text-blue-700 dark:text-blue-400">📘 من نحن</h1>
        <p className="text-lg leading-relaxed">
          نحن في <strong className="text-blue-600 dark:text-blue-300">Ma7al Store</strong> نعمل على توفير أحدث الإلكترونيات بأفضل الأسعار.
        </p>
        <p className="mt-4 text-lg">
          رؤيتنا هي أن نكون الوجهة الأولى لعشاق التكنولوجيا في العراق والمنطقة.
        </p>
      </motion.div>
    </div>
  );
}
