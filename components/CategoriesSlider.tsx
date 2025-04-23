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
  const [sliderRef] = useKeenSlider({ mode: "free", slides: { perView: "auto", spacing: 12 } });
  return (
    <div className="bg-[#1e293b] px-4 py-3">
      <div ref={sliderRef} className="keen-slider">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="keen-slider__slide bg-[#334155] hover:bg-[#3b82f6] hover:text-white text-sm px-4 py-2 rounded-full whitespace-nowrap text-slate-100"
            style={{ width: "auto" }}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}