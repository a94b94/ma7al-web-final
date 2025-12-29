"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  name: string;
  description: string;
  specs?: string[];
  price: number;
  storage: string;
  image: string;
  location: string;
  phone: string;
  link?: string;

  /**
   * ✅ اختياري: إذا هذا الإعلان أعلى الصفحة (Hero/Top ad)
   * خلّي الصورة Priority لتحسين LCP
   */
  priority?: boolean;
};

const TINY_BLUR =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export default function ProductAdCard({
  name,
  description,
  specs = [],
  price,
  storage,
  image,
  location,
  phone,
  link,
  priority = false,
}: Props) {
  const hasLink = Boolean(link) && link !== "#";

  return (
    <section
      dir="rtl"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 max-w-4xl mx-auto mb-6 border border-gray-100 dark:border-gray-700"
      aria-label={`إعلان المنتج: ${name}`}
    >
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* الصورة */}
        <div className="flex-1 w-full">
          <div className="relative w-full overflow-hidden rounded-xl">
            <Image
              src={image}
              alt={name}
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={75}
              placeholder="blur"
              blurDataURL={TINY_BLUR}
              priority={priority}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* التفاصيل */}
        <div className="flex-1 w-full space-y-2 text-right">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 leading-snug">
            {name}
          </h2>

          {description?.trim() ? (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          ) : null}

          {specs.length > 0 ? (
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              {specs.map((s, i) => (
                <li key={`${s}-${i}`}>{s}</li>
              ))}
            </ul>
          ) : null}

          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            {price.toLocaleString("ar-IQ")} د.ع — {storage}
          </p>

          {hasLink ? (
            <Link
              href={link as string}
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={`اشترِ الآن: ${name}`}
              prefetch
            >
              اشترِ الآن
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full text-sm cursor-not-allowed"
              aria-disabled="true"
              title="الرابط غير متوفر"
            >
              غير متوفر
            </button>
          )}

          <div className="pt-2 space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">📍 {location}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">📞 {phone}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
