"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartOff, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        ❤️ المنتجات المفضلة
      </h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center text-gray-500 dark:text-gray-300">
          <HeartOff className="w-12 h-12 mb-4" />
          <p>لم تقم بإضافة منتجات إلى المفضلة بعد.</p>
          <Link
            href="/"
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
          >
            🔙 العودة إلى المتجر
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition flex flex-col"
            >
              <Link
                href={`/product/${item.id}`}
                className="p-3 flex flex-col items-center"
              >
                <img
                  src={item.image || "/no-image.png"}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-40 object-cover rounded-md"
                />
                <h3 className="mt-2 text-sm font-semibold text-center text-gray-800 dark:text-white line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-blue-600 font-bold text-sm mt-1">
                  {item.price.toLocaleString()} د.ع
                </p>
              </Link>

              <button
                onClick={() =>
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                  })
                }
                className="mt-auto m-3 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-full flex items-center justify-center gap-1 transition"
              >
                <ShoppingCart size={16} />
                أضف إلى السلة
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
