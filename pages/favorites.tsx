"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartOff, ShoppingCart, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  storeId: string;
  storeName: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const handleAddToCart = (item: FavoriteItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      storeId: item.storeId,
      storeName: item.storeName,
    });
    toast.success("✅ تم إضافة المنتج إلى السلة!");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* زر رجوع */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
      >
        <ArrowLeft size={18} />
        الرجوع
      </button>

      {/* العنوان */}
      <motion.h1
        className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        ❤️ المنتجات المفضلة
      </motion.h1>

      {/* لا توجد مفضلات */}
      {favorites.length === 0 ? (
        <motion.div
          className="flex flex-col items-center text-gray-500 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <HeartOff className="w-12 h-12 mb-4" />
          <p>لم تقم بإضافة منتجات إلى المفضلة بعد.</p>
          <Link
            href="/"
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
          >
            🔙 العودة إلى المتجر
          </Link>
        </motion.div>
      ) : (
        // ✅ شبكة المنتجات
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {favorites.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
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
                onClick={() => handleAddToCart(item)}
                className="mt-auto m-3 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-full flex items-center justify-center gap-1 transition"
              >
                <ShoppingCart size={16} />
                أضف إلى السلة
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
