"use client";

import React from "react";
import ProductCard from "./ProductCard";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { motion } from "framer-motion";

interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
}

interface ProductSliderProps {
  products: Product[];
  loading?: boolean;
  onAddToCart: (product: Product) => void;
}

export default function ProductSlider({ products, loading, onAddToCart }: ProductSliderProps) {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "snap",
    slides: {
      perView: 2,
      spacing: 12,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 3, spacing: 16 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 4, spacing: 20 },
      },
    },
  });

  if (loading) {
    return <p className="text-center py-10 text-gray-500">⏳ جاري تحميل المنتجات...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center py-10 text-gray-500">📭 لا توجد منتجات حالياً</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div ref={sliderRef} className="keen-slider px-2">
        {products.map((product) => (
          <div key={product._id} className="keen-slider__slide">
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
