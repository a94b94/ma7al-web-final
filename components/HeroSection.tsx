"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [heroImages, setHeroImages] = useState({
    phone: "",
    appliance: "",
    background: "",
  });

  useEffect(() => {
    fetch("/api/settings/hero-images")
      .then((res) => res.json())
      .then((data) => setHeroImages(data));
  }, []);

  return (
    <section className="relative text-white py-20 px-4 sm:px-8 lg:px-16 overflow-hidden">
      {/* ✅ الخلفية الديناميكية أو الافتراضية */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        {heroImages.background ? (
          <Image
            src={heroImages.background}
            alt="Hero background"
            fill
            className="object-cover"
          />
        ) : (
          <Image
            src="/images/tech-pattern.svg"
            alt="background pattern"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* ✅ صور الهاتف والجهاز */}
      {heroImages.phone && heroImages.appliance && (
        <div className="hidden lg:flex absolute top-1/2 right-16 transform -translate-y-1/2 z-10 gap-6">
          <Image
            src={heroImages.phone}
            alt="هاتف حديث"
            width={200}
            height={200}
            className="rounded-xl shadow-lg"
          />
          <Image
            src={heroImages.appliance}
            alt="جهاز كهربائي"
            width={200}
            height={200}
            className="rounded-xl shadow-lg"
          />
        </div>
      )}

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
