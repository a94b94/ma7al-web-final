"use client";
import Link from "next/link";
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
];

export default function CategoriesSection() {
  return (
    <section className="py-10 px-4 bg-gray-50 dark:bg-gray-900 transition">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        🗂️ الأقسام
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 max-w-5xl mx-auto">
        {categories.map(({ name, slug, icon: Icon }) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            title={`عرض منتجات ${name}`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 text-center hover:bg-blue-50 dark:hover:bg-blue-900 transition-all duration-200 group"
          >
            <Icon className="mx-auto mb-3 w-9 h-9 text-blue-600 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-lg text-gray-900 dark:text-white">{name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
