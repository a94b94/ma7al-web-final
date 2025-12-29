// components/CategoriesSlider.tsx
"use client";

import Link from "next/link";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const categories = [
  { name: "📱 هواتف", slug: "phones" },
  { name: "⌚ ساعات", slug: "watches" },
  { name: "💻 إلكترونيات", slug: "electronics" },
  { name: "🌐 أجهزة إنترنت", slug: "internet-devices" },
  { name: "📸 كاميرات", slug: "cameras" },
  { name: "🎧 إكسسوارات", slug: "accessories" },
];

export default function CategoriesSlider() {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    rtl: true, // ✅ مهم للغة العربية
    mode: "free-snap", // ✅ أفضل من free للّمس (يبقى قريب من snap)
    drag: true,
    rubberband: true,
    renderMode: "performance",
    slides: {
      perView: "auto",
      spacing: 12,
    },
  });

  return (
    <nav
      aria-label="أقسام المنتجات"
      className="bg-slate-800 px-4 py-3 overflow-hidden"
      dir="rtl"
    >
      <div ref={sliderRef} className="keen-slider">
        {categories.map((cat) => (
          <div key={cat.slug} className="keen-slider__slide !w-auto">
            <Link
              href={`/category/${cat.slug}`}
              aria-label={`اذهب إلى قسم ${cat.name}`}
              className="block bg-slate-700 hover:bg-blue-500 hover:text-white text-sm px-4 py-2 rounded-full whitespace-nowrap text-slate-100 transition-colors select-none"
              prefetch={false}
            >
              {cat.name}
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
}
