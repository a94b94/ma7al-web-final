"use client";

import Link from "next/link";

const categories = [
  { name: "إلكترونيات", slug: "electronics" },
  { name: "هواتف", slug: "phones" },
  { name: "ساعات", slug: "watches" },
  { name: "أجهزة إنترنت", slug: "internet-devices" },
  { name: "كاميرات", slug: "cameras" },
  { name: "إكسسوارات", slug: "accessories" },
];

export default function CategoriesBar() {
  return (
    <nav
      className="bg-[#232f3e] text-white py-2 overflow-x-auto scroll-smooth no-scrollbar"
      aria-label="شريط تصفح الأقسام"
    >
      <div className="max-w-7xl mx-auto flex gap-4 px-4 whitespace-nowrap">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="text-sm px-3 py-1 rounded hover:bg-blue-500 transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
