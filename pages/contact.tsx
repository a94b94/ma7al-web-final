"use client";

import Head from "next/head";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRightCircle } from "lucide-react";
import { useRouter } from "next/router";

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-16 text-gray-800 dark:text-white transition-colors duration-300">
      <Head>
        <title>اتصل بنا - Ma7al Store</title>
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* ✅ العنوان */}
        <motion.h1
          className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          📞 اتصل بنا
        </motion.h1>

        {/* ✅ نص الترحيب */}
        <motion.p
          className="text-lg leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          إذا كانت لديك أي استفسارات أو تحتاج إلى مساعدة، لا تتردد في التواصل معنا:
        </motion.p>

        {/* ✅ معلومات التواصل */}
        <motion.ul
          className="mt-6 space-y-4 text-lg"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
        >
          <motion.li
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Mail className="text-blue-600" size={20} />
            <span>support@ma7alstore.com</span>
          </motion.li>

          <motion.li
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Phone className="text-green-600" size={20} />
            <span>+964 770 000 0000</span>
          </motion.li>

          <motion.li
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <MapPin className="text-red-600" size={20} />
            <span>بغداد - الكرادة - شارع التقنية</span>
          </motion.li>
        </motion.ul>

        {/* ✅ زر رجوع */}
        <motion.button
          onClick={() => router.back()}
          className="mt-10 inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-white transition"
          whileHover={{ x: -5 }}
        >
          <ArrowRightCircle size={20} />
          <span>الرجوع للخلف</span>
        </motion.button>
      </div>
    </div>
  );
}
