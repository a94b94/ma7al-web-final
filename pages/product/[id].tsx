"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import ProductSlider from "@/components/ProductSlider";

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setProduct(data);

        if (data?.category) {
          const simRes = await fetch(`/api/products?category=${data.category}&exclude=${data._id}`);
          const simData = await simRes.json();
          setSimilarProducts(simData);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-center py-10">⏳ جارٍ تحميل المنتج...</p>;
  if (!product) return <p className="text-center py-10 text-red-500">❌ المنتج غير موجود</p>;

  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="rounded-xl object-contain w-full h-[400px] bg-gray-100"
          />
        </div>

        <div className="flex flex-col justify-center gap-4">
          <h1 className="text-4xl font-extrabold text-gray-800">{product.name}</h1>
          <p className="text-gray-500 text-sm">📂 القسم: {product.category}</p>

          {hasDiscount ? (
            <div>
              <p className="text-red-600 text-2xl font-bold">
                {discountedPrice.toLocaleString()} د.ع
              </p>
              <p className="line-through text-gray-400 text-sm">
                {product.price.toLocaleString()} د.ع
              </p>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                خصم {product.discount}%
              </span>
            </div>
          ) : (
            <p className="text-xl font-bold text-green-700">
              {product.price.toLocaleString()} د.ع
            </p>
          )}

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm text-gray-700 rounded">
            <p className="font-semibold">📝 وصف مختصر:</p>
            <p>تصميم أنيق وتصنيع متين</p>
            <ul className="list-disc list-inside mt-2">
              <li>نوع المعالج: {product.processor}</li>
              <li>نوع الشاشة: {product.screen}</li>
              <li>البطارية: {product.battery}</li>
              <li>الذاكرة: {product.memory}</li>
            </ul>
          </div>

          <button
            onClick={() =>
              addToCart({
                id: product._id,
                name: product.name,
                price: discountedPrice,
                image: product.image,
              })
            }
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded text-lg font-semibold shadow"
          >
            اشترِ الآن 🛒
          </button>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-4">🧠 منتجات مشابهة</h2>
          <ProductSlider
            products={similarProducts}
            onAddToCart={(product: any) =>
              addToCart({
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
              })
            }
          />
        </div>
      )}
    </div>
  );
}
