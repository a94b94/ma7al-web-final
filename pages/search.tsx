"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  images: string[];
  category: string;
}

const allCategories = ["موبايلات", "لابتوبات", "سماعات", "ساعات", "أجهزة كهربائية"];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [maxPrice, setMaxPrice] = useState<number>(0);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        const products = data.products || [];
        setResults(products);
        const highest = Math.max(...products.map((p: Product) => p.price));
        setMaxPrice(highest);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  const filtered = results.filter((p) => {
    const price = p.discount && p.discount > 0 ? Math.round(p.price - p.price * (p.discount / 100)) : p.price;
    return (selectedCategory === "الكل" || p.category === selectedCategory) && price <= maxPrice;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        نتائج البحث لـ: <span className="text-blue-600">{query}</span>
      </h1>

      {/* الفلاتر */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border px-3 py-1 rounded text-sm dark:bg-gray-800 dark:text-white"
        >
          <option value="الكل">كل الفئات</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <label className="text-sm dark:text-white">السعر الأعلى:</label>
          <input
            type="range"
            min={0}
            max={Math.max(...results.map((p) => p.price), 1000)}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-40"
          />
          <span className="text-sm text-gray-700 dark:text-white">{maxPrice} د.ع</span>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">جارٍ التحميل...</p>
      ) : filtered.length === 0 ? (
        <div className="text-red-600 dark:text-red-400">
          <p>لا توجد نتائج مطابقة للفلاتر المحددة.</p>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">ربما يعجبك أحد هذه المنتجات:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {results.slice(0, 4).map((product) => {
              const hasDiscount = product.discount && product.discount > 0;
              const finalPrice = hasDiscount
                ? Math.round(product.price - product.price * (product.discount! / 100))
                : product.price;

              return (
                <Link
                  href={`/product/${product._id}`}
                  key={product._id}
                  className="border rounded-lg p-3 hover:shadow-md bg-white dark:bg-gray-900"
                >
                  <Image
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-contain rounded mb-2"
                  />
                  <h3 className="font-semibold text-sm mb-1 text-gray-800 dark:text-white">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {hasDiscount ? (
                      <>
                        <span className="line-through text-red-500 mr-2">{product.price} د.ع</span>
                        <span className="text-green-600 font-bold">{finalPrice} د.ع</span>
                      </>
                    ) : (
                      <span className="font-medium">{product.price} د.ع</span>
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => {
            const hasDiscount = product.discount && product.discount > 0;
            const finalPrice = hasDiscount
              ? Math.round(product.price - product.price * (product.discount! / 100))
              : product.price;

            return (
              <Link
                href={`/product/${product._id}`}
                key={product._id}
                className="border rounded-lg p-3 hover:shadow-md bg-white dark:bg-gray-900"
              >
                <Image
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-contain rounded mb-2"
                />
                <h3 className="font-semibold text-sm mb-1 text-gray-800 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {hasDiscount ? (
                    <>
                      <span className="line-through text-red-500 mr-2">{product.price} د.ع</span>
                      <span className="text-green-600 font-bold">{finalPrice} د.ع</span>
                    </>
                  ) : (
                    <span className="font-medium">{product.price} د.ع</span>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
