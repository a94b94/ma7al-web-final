"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SimilarProducts({
  currentProductId,
  category,
}: {
  currentProductId: string;
  category: string;
}) {
  const { data: products, error } = useSWR(
    category
      ? `/api/products/similar?category=${encodeURIComponent(category)}&exclude=${currentProductId}`
      : null,
    fetcher
  );

  if (error) return null;
  if (!products || products.length === 0) return null;

  return (
    <div className="mt-16 px-4">
      <h2 className="text-2xl font-extrabold text-center mb-8 text-indigo-600">
        🌀 منتجات مشابهة قد تهمك
      </h2>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {products.map((product: any) => (
          <motion.div
            key={product._id}
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href={`/product/${product._id}`}
              className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg border block"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={product.image || "/images/default.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-xl"
                />
              </div>
              <div className="p-4">
                <h3 className="text-base font-semibold mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-blue-600 font-bold">
                  {Number(product.price).toLocaleString()} د.ع
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
