import React from "react";
import ProductCard from "./ProductCard";

interface ProductSliderProps {
  products: any[];
  loading?: boolean; // ✅ أضف هذا السطر
}

export default function ProductSlider({ products, loading }: ProductSliderProps) {
  if (loading) {
    return <p className="text-center py-10 text-gray-500">⏳ جاري التحميل...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center py-10 text-gray-500">📭 لا توجد منتجات حالياً</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4">
      {products.map((product, index) => (
        <ProductCard key={index} product={product} />
      ))}
    </div>
  );
}
