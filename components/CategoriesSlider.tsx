"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Link from "next/link";

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
    mode: "free",
    slides: {
      perView: "auto",
      spacing: 12,
    },
  });

  return (
    <div className="bg-slate-800 px-4 py-3 overflow-hidden">
      <div ref={sliderRef} className="keen-slider">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            aria-label={`اذهب إلى قسم ${cat.name}`}
            className="keen-slider__slide bg-slate-700 hover:bg-blue-500 hover:text-white text-sm px-4 py-2 rounded-full whitespace-nowrap text-slate-100 transition-colors"
            style={{ width: "auto" }}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
