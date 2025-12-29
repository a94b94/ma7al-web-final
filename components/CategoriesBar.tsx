// components/CategoriesBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";

const categories = [
  { name: "إلكترونيات", slug: "electronics" },
  { name: "هواتف", slug: "phones" },
  { name: "ساعات", slug: "watches" },
  { name: "أجهزة إنترنت", slug: "internet-devices" },
  { name: "كاميرات", slug: "cameras" },
  { name: "إكسسوارات", slug: "accessories" },
] as const;

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function CategoriesBar() {
  const pathname = usePathname();

  const activeSlug = useMemo(() => {
    const m = pathname?.match(/^\/category\/([^/]+)/);
    return m?.[1] || "";
  }, [pathname]);

  return (
    <nav
      dir="rtl"
      className="bg-[#232f3e] text-white py-2 border-b border-white/10"
      aria-label="شريط تصفح الأقسام"
    >
      <div
        className="
          max-w-7xl mx-auto px-3 sm:px-4
          overflow-x-auto scroll-smooth no-scrollbar
        "
      >
        <div className="flex gap-2 sm:gap-3 whitespace-nowrap py-1">
          {categories.map((cat) => {
            const isActive = activeSlug === cat.slug;

            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                prefetch={false}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-full transition-colors",
                  "hover:bg-blue-500/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#232f3e]",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white/5 text-white/90"
                )}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default memo(CategoriesBar);
