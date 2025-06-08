"use client";

import { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function StoreProductsPage({ products, storeName, storeId }: { products: any[]; storeName: string; storeId: string }) {
  const router = useRouter();

  // ✅ زيادة عدد الزيارات عند فتح الصفحة
  useEffect(() => {
    if (storeId) {
      fetch("/api/stores/increment-views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
    }
  }, [storeId]);

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ArrowLeft size={18} />
        <span>رجوع</span>
      </button>

      <motion.h1
        className="text-3xl font-bold mb-8 text-center text-blue-800 dark:text-blue-300"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        🏪 منتجات متجر {storeName}
      </motion.h1>

      {products.length === 0 ? (
        <motion.p
          className="text-center text-gray-500 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          لا توجد منتجات لهذا المتجر حالياً.
        </motion.p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Link href={`/product/${product._id}`} className="block">
                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow hover:shadow-md p-4 text-center transition-all duration-300">
                  <Image
                    src={product.image || "/no-image.png"}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="object-contain w-full h-48 mx-auto rounded bg-gray-100 dark:bg-gray-700"
                  />
                  <h3 className="text-lg font-semibold mt-2 text-gray-800 dark:text-white">{product.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                    {product.price.toLocaleString()} د.ع
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ✅ جلب المنتجات + اسم المتجر + ID لتحديث الزيارات
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/by-store/${id}`);
  const products = await res.json();

  const storeRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/stores`);
  const stores = await storeRes.json();
  const store = stores.find((s: any) => s._id === id);

  return {
    props: {
      products,
      storeName: store?.storeName || "غير معروف",
      storeId: id || "",
    },
  };
};
