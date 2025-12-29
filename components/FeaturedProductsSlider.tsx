// components/FeaturedProductsSlider.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

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
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    rtl: true, // ✅ مهم للعربي
    renderMode: "performance",
    mode: "snap",
    dragSpeed: 1,
    slides: { perView: 2, spacing: 12 },
    breakpoints: {
      "(min-width: 640px)": { slides: { perView: 3, spacing: 16 } },
      "(min-width: 1024px)": { slides: { perView: 4, spacing: 20 } },
    },
    // ✅ يمنع مشاكل التحديد أحياناً
    selector: ".keen-slider__slide",
  });

  if (!products || products.length === 0) return null;

  return (
    <section className="py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        🔥 المنتجات المميزة
      </h2>

      <div ref={sliderRef} className="keen-slider px-1">
        {products.map((product, idx) => (
          <div key={product._id} className="keen-slider__slide">
            <Link
              href={`/product/${product._id}`}
              className="block bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden border border-black/5 dark:border-white/10"
              aria-label={`عرض المنتج: ${product.name}`}
            >
              <div className="relative w-full h-40 bg-white/60 dark:bg-black/10">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-2"
                  priority={idx < 2} // ✅ أول عنصرين أسرع
                />
              </div>

              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {product.name}
                </h3>

                <p className="text-blue-600 dark:text-blue-400 font-bold mt-2">
                  {product.price.toLocaleString("ar-IQ")} د.ع
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
