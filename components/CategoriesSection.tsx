// components/CategoriesSection.tsx
"use client";

import Link from "next/link";
import { memo } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Power,
  PackageSearch,
} from "lucide-react";

const categories = [
  { name: "موبايلات", slug: "mobiles", icon: Smartphone },
  { name: "لابتوبات", slug: "laptops", icon: Laptop },
  { name: "سماعات", slug: "headphones", icon: Headphones },
  { name: "ساعات", slug: "watches", icon: Watch },
  { name: "أجهزة كهربائية", slug: "electronics", icon: Power },
  { name: "أخرى", slug: "other", icon: PackageSearch },
] as const;

function CategoriesSection() {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    mode: "free-snap",
    rubberband: true,
    slides: { perView: 2.2, spacing: 12 },
    breakpoints: {
      "(min-width: 480px)": { slides: { perView: 3.2, spacing: 14 } },
      "(min-width: 640px)": { slides: { perView: 4.2, spacing: 16 } },
    },
  });

  const Card = ({
    name,
    slug,
    icon: Icon,
  }: (typeof categories)[number]) => (
    <Link
      href={`/category/${slug}`}
      aria-label={`عرض منتجات قسم ${name}`}
      prefetch={false}
      className="
        group rounded-2xl border border-gray-200/70 dark:border-gray-700/60
        bg-white dark:bg-gray-800
        p-5 text-center shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        hover:bg-blue-50 dark:hover:bg-blue-900/20
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-gray-900
      "
    >
      <Icon
        className="mx-auto mb-3 h-9 w-9 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-110"
        aria-hidden="true"
      />
      <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
        {name}
      </p>
      <span className="sr-only">{`اذهب إلى قسم ${name}`}</span>
    </Link>
  );

  return (
    <section
      dir="rtl"
      aria-label="الأقسام"
      className="py-10 px-4 bg-gray-50 dark:bg-gray-900 transition"
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        🗂️ الأقسام
      </h2>

      {/* ✅ موبايل/تابلت: سلايدر */}
      <div className="block lg:hidden">
        <div ref={sliderRef} className="keen-slider">
          {categories.map((c) => (
            <div
              key={c.slug}
              className="keen-slider__slide"
              style={{ minWidth: 0 }}
            >
              <Card {...c} />
            </div>
          ))}
        </div>
      </div>

      {/* ✅ ديسكتوب: Grid */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-4 gap-5 max-w-5xl mx-auto">
          {categories.map((c) => (
            <Card key={c.slug} {...c} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(CategoriesSection);
