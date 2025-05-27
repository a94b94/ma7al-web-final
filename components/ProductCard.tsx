"use client";

import { ShoppingCart } from "lucide-react";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price - (product.price * (product.discount || 0)) / 100
    : product.price;

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden border dark:border-slate-700">
      {/* صورة المنتج */}
      <div className="relative overflow-hidden">
        <Image
          src={product.image}
          alt={`صورة منتج ${product.name}`}
          width={400}
          height={400}
          className="w-full h-48 object-cover transform group-hover:scale-105 transition duration-300"
        />

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            خصم {product.discount}%  
          </div>
        )}
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4">
        <h3 className="text-sm font-semibold truncate mb-1 text-slate-800 dark:text-white">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {product.price.toLocaleString("ar-IQ")} د.ع
            </span>
          )}
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {discountedPrice.toLocaleString("ar-IQ")} د.ع
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          className="w-full bg-blue-600 hover:bg-blue-700 transition text-white text-sm py-2 rounded-lg flex items-center justify-center gap-2"
          title="أضف المنتج إلى السلة"
        >
          <ShoppingCart size={18} />
          أضف للسلة
        </button>
      </div>
    </div>
  );
}
