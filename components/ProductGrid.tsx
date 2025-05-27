"use client";

import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-300 py-10">
        لا توجد منتجات لعرضها حالياً.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}
