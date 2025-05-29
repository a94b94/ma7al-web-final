"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
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
          const simRes = await fetch(`/api/products?category=${data.category}`);
          const simData = await simRes.json();
          const filtered = simData.filter((p: any) => p._id !== data._id);
          setSimilarProducts(filtered);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-center py-10">جارٍ تحميل المنتج...</p>;
  if (!product) return <p className="text-center py-10 text-red-500">المنتج غير موجود</p>;

  const hasDiscount = product?.discount && product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="rounded-lg object-contain w-full h-[400px] bg-white"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-500">الفئة: {product.category}</p>

          {hasDiscount ? (
            <div>
              <p className="text-red-600 text-xl font-bold">
                {discountedPrice.toLocaleString()} د.ع
              </p>
              <p className="line-through text-gray-400 text-sm">
                {product.price.toLocaleString()} د.ع
              </p>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">خصم {product.discount}%</span>
            </div>
          ) : (
            <p className="text-lg font-bold text-green-700">
              {product.price.toLocaleString()} د.ع
            </p>
          )}

          <button
            onClick={() => addToCart({
              id: product._id,
              name: product.name,
              price: discountedPrice,
              image: product.image,
            })}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded mt-4 transition"
          >
            أضف إلى السلة 🛒
          </button>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-center">🧠 منتجات مشابهة</h2>
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
