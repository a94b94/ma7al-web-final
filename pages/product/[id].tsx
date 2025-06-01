"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import ProductSlider from "@/components/ProductSlider";
import { Heart, HeartOff } from "lucide-react";

export default function ProductPage() {
  const router = useRouter();
  const { isReady, query } = router;
  const id = isReady ? query.id : null;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [activeAd, setActiveAd] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [res, adRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch(`/api/ads/active`),
        ]);

        const data = await res.json();
        setProduct(data);

        const adData = await adRes.json();
        if (adData?.product?._id === id) {
          setActiveAd(adData);
          updateCountdown(adData.expiresAt);
        }

        if (data?.category) {
          const simRes = await fetch(
            `/api/products?category=${data.category}&exclude=${data._id}`
          );
          const simData = await simRes.json();
          setSimilarProducts(simData);
        }

        if (typeof window !== "undefined") {
          const favs = localStorage.getItem("favorites");
          if (favs) {
            const favList = JSON.parse(favs);
            setIsFavorite(favList.some((p: any) => p.id === data._id));
          }
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const updateCountdown = (endTime: string) => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;

      if (distance <= 0) {
        clearInterval(interval);
        setCountdown("انتهى العرض");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${hours} س ${minutes} د ${seconds} ث`);
    }, 1000);
  };

  const toggleFavorite = () => {
    if (typeof window === "undefined") return;

    const favs = localStorage.getItem("favorites");
    let favList = favs ? JSON.parse(favs) : [];

    if (isFavorite) {
      favList = favList.filter((p: any) => p.id !== product._id);
    } else {
      favList.push({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }

    localStorage.setItem("favorites", JSON.stringify(favList));
    setIsFavorite(!isFavorite);
  };

  if (!isReady || loading) return <p className="text-center py-10">⏳ جارٍ تحميل المنتج...</p>;
  if (!product) return <p className="text-center py-10 text-red-500">❌ المنتج غير موجود</p>;

  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price - (product.price * product.discount) / 100
    : product.price;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {activeAd && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6 shadow text-center">
          <h2 className="font-bold text-lg">🎉 {activeAd.title}</h2>
          <p className="text-sm">{activeAd.description}</p>
          <p className="text-sm mt-1">⏰ {countdown}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={500}
            height={500}
            className="rounded-xl object-contain w-full h-[400px] bg-gray-100 dark:bg-gray-700"
          />
        </div>

        <div className="flex flex-col justify-center gap-4">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
            {product.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm">📂 القسم: {product.category}</p>

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
            <p className="text-xl font-bold text-green-700 dark:text-green-400">
              {product.price.toLocaleString()} د.ع
            </p>
          )}

          {product.highlightHtml && (
            <div
              className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 text-sm text-gray-700 dark:text-gray-200 rounded"
              dangerouslySetInnerHTML={{ __html: product.highlightHtml }}
            />
          )}

          <div className="flex gap-4">
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

            <button
              onClick={toggleFavorite}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 rounded shadow hover:bg-gray-300 dark:hover:bg-gray-600"
              title="أضف إلى المفضلة"
            >
              {isFavorite ? <Heart className="text-red-500" /> : <HeartOff />}
            </button>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
            🧠 منتجات مشابهة
          </h2>
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
