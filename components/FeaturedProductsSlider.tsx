// components/FeaturedProductsSlider.tsx
"use client";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Link from "next/link";

type Product = {
  _id: string;
  name: string;
  image: string;
  price: number;
};

interface Props {
  products: Product[];
}

export default function FeaturedProductsSlider({ products }: Props) {
  const [sliderRef] = useKeenSlider({
    loop: true,
    slides: { perView: 2, spacing: 15 },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 3, spacing: 20 } },
      "(min-width: 1024px)": { slides: { perView: 4, spacing: 24 } },
    },
  });

  if (products.length === 0) return null;

  return (
    <section className="py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        🔥 المنتجات المميزة
      </h2>
      <div ref={sliderRef} className="keen-slider">
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/product/${product._id}`}
            className="keen-slider__slide bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-contain mb-3 rounded"
            />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
            <p className="text-blue-600 font-bold mt-1">{product.price.toLocaleString()} د.ع</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
