import { useRouter } from "next/router";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { ShoppingCart, Eye, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { addToCart } = useCart();

  const { data: products, error } = useSWR(
    slug ? `/api/products/category/${slug}` : null,
    fetcher
  );

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      storeId: product.storeId,
      storeName: product.storeName,
    });
    toast.success("✅ تم إضافة المنتج إلى السلة!");
  };

  if (error)
    return <p className="text-center text-red-500 mt-10">❌ فشل في جلب المنتجات</p>;
  if (!products)
    return <p className="text-center mt-10 text-gray-600">⏳ جاري تحميل المنتجات...</p>;

  return (
    <div className="bg-[#f9f9f9] min-h-screen py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 🔙 زر الرجوع */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
          >
            <ArrowLeft size={18} /> رجوع
          </button>
        </div>

        <motion.h1
          className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🛒 تصفّح قسم <span className="text-blue-600 capitalize">{slug}</span>
        </motion.h1>

        {products.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">لا توجد منتجات حالياً بهذا القسم.</p>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            {products.map((product: any) => {
              const hasDiscount = product.discount > 0;
              const finalPrice = hasDiscount
                ? Math.floor(product.price * (1 - product.discount / 100))
                : product.price;

              return (
                <motion.div
                  key={product._id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden border dark:border-slate-700 group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={product.image || "/images/default.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover transform group-hover:scale-105 transition duration-300"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        خصم {product.discount}%
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col justify-between h-[190px]">
                    <h3 className="text-sm font-semibold truncate text-slate-800 dark:text-white mb-1">
                      {product.name}
                    </h3>

                    <div className="mb-2">
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-bold text-base">
                            {finalPrice.toLocaleString()} د.ع
                          </span>
                          <span className="line-through text-gray-400 text-sm">
                            {product.price.toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-blue-600 font-bold text-base">
                          {product.price.toLocaleString()} د.ع
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link href={`/product/${product._id}`}>
                        <button className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white text-xs py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition flex items-center justify-center gap-1">
                          <Eye size={16} /> عرض
                        </button>
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <ShoppingCart size={16} /> للسلة
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
