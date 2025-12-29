"use client";

import React, { memo, useMemo } from "react";
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

  /**
   * ✅ اختياري: خلّي أول كم صورة بالصفحة Priority لتحسين LCP
   * استخدمه بالهوم لأول سلايدر/أول عناصر فقط
   */
  priority?: boolean;
}

/**
 * ✅ Blur placeholder خفيف (1x1) حتى ما يتأثر الحجم
 * تقدر تستبدله لاحقًا ب blurDataURL حقيقي من Cloudinary/Uploadcare
 */
const TINY_BLUR =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

function clampDiscount(v: unknown) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  if (n > 90) return 90; // حماية من قيم غلط
  return n;
}

function calcDiscountedPrice(price: number, discount: number) {
  // price - (price * discount)/100
  const p = Number(price);
  if (!Number.isFinite(p) || p <= 0) return 0;
  const d = clampDiscount(discount);
  if (d === 0) return p;
  return Math.round(p - (p * d) / 100);
}

function ProductCardComponent({ product, onAddToCart, priority }: ProductCardProps) {
  const discount = useMemo(() => clampDiscount(product.discount), [product.discount]);

  const hasDiscount = discount > 0;

  const discountedPrice = useMemo(
    () => calcDiscountedPrice(product.price, discount),
    [product.price, discount]
  );

  // ✅ تحسينات صور: sizes مهم جداً مع السلايدر (Responsive)
  const sizes =
    "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden border dark:border-slate-700">
      {/* صورة المنتج */}
      <div className="relative overflow-hidden">
        <Image
          src={product.image}
          alt={`صورة منتج ${product.name}`}
          width={400}
          height={400}
          sizes={sizes}
          quality={75}
          placeholder="blur"
          blurDataURL={TINY_BLUR}
          priority={Boolean(priority)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="w-full h-48 object-cover transform group-hover:scale-105 transition duration-300"
        />

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            خصم {discount}%
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
              {Number(product.price).toLocaleString("ar-IQ")} د.ع
            </span>
          )}
          <span className="text-blue-600 dark:text-blue-400 font-bold">
            {Number(discountedPrice).toLocaleString("ar-IQ")} د.ع
          </span>
        </div>

        <button
          type="button"
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

/**
 * ✅ memo يقلل rerenders داخل السلايدر
 * نتحقق من تغيّر المنتج أو تغيّر callback
 */
const ProductCard = memo(
  ProductCardComponent,
  (prev, next) =>
    prev.product._id === next.product._id &&
    prev.product.price === next.product.price &&
    prev.product.discount === next.product.discount &&
    prev.product.image === next.product.image &&
    prev.product.name === next.product.name &&
    prev.onAddToCart === next.onAddToCart &&
    prev.priority === next.priority
);

export default ProductCard;
