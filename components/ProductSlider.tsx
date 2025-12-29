"use client";

import React, { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider, KeenSliderInstance } from "keen-slider/react";
import { motion } from "framer-motion";

// ✅ الأفضل يكون ProductCard dynamic إذا ثقيل (صور/أنيميشن)
const ProductCard = dynamic(() => import("./ProductCard"), {
  ssr: false,
});

interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
}

interface ProductSliderProps {
  products: Product[];
  loading?: boolean;
  onAddToCart: (product: Product) => void;
}

function SkeletonRow() {
  return (
    <div className="px-2 py-6">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[160px] sm:min-w-[200px] lg:min-w-[240px] bg-white/60 dark:bg-white/10 rounded-xl p-3"
          >
            <div className="h-32 sm:h-36 lg:h-40 rounded-lg bg-black/10 dark:bg-white/10 animate-pulse" />
            <div className="mt-3 h-4 w-3/4 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
            <div className="mt-2 h-4 w-1/2 rounded bg-black/10 dark:bg-white/10 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductSlider({
  products,
  loading,
  onAddToCart,
}: ProductSliderProps) {
  const safeProducts = Array.isArray(products) ? products : [];

  // ✅ إعدادات السلايدر ثابتة (memo) لتقليل إعادة التهيئة
  const sliderOptions = useMemo(
    () => ({
      loop: false,
      mode: "snap" as const,
      rubberband: true,
      renderMode: "performance" as const, // ✅ يحسن الأداء
      slides: {
        perView: 2,
        spacing: 12,
      },
      breakpoints: {
        "(min-width: 640px)": {
          slides: { perView: 3, spacing: 16 },
        },
        "(min-width: 1024px)": {
          slides: { perView: 4, spacing: 20 },
        },
      },
    }),
    []
  );

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(sliderOptions);

  // ✅ لما تتغيّر المنتجات (خصوصاً أول تحميل)، حدّث القياسات
  useEffect(() => {
    const inst: KeenSliderInstance | null = instanceRef.current;
    if (!inst) return;
    // update بعد رندر الدوم
    requestAnimationFrame(() => {
      try {
        inst.update();
      } catch {
        // ignore
      }
    });
  }, [safeProducts.length, instanceRef]);

  // ✅ تنظيف عند unmount
  useEffect(() => {
    return () => {
      try {
        instanceRef.current?.destroy();
      } catch {
        // ignore
      }
    };
  }, [instanceRef]);

  if (loading) return <SkeletonRow />;

  if (safeProducts.length === 0) {
    return (
      <p className="text-center py-10 text-gray-500">📭 لا توجد منتجات حالياً</p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div ref={sliderRef} className="keen-slider px-2">
        {safeProducts.map((product) => (
          <div key={product._id} className="keen-slider__slide">
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
