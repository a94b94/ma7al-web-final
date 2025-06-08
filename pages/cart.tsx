"use client";

import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

export default function CartPage() {
  const { cart, removeFromCart, increaseQty, decreaseQty, clearCart } = useCart();
  const router = useRouter();

  const total = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 🔙 زر الرجوع */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ArrowLeft size={18} />
        <span>رجوع</span>
      </button>

      <motion.h1
        className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        🛒 سلة الشراء
      </motion.h1>

      {cart.length === 0 ? (
        <motion.p
          className="text-center text-gray-500 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          سلتك فارغة حالياً.
        </motion.p>
      ) : (
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {cart.map((item) => (
            <motion.div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center justify-between"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-4 w-full">
                <img
                  src={item.image || "/no-image.png"}
                  alt={item.name}
                  title={item.name}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-blue-600 font-semibold">
                    {item.price.toLocaleString()} د.ع
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    🏪 {item.storeName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                    disabled={item.quantity <= 1}
                    title="إنقاص الكمية"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="text-lg font-bold text-gray-800 dark:text-white min-w-[24px] text-center">
                    {item.quantity || 1}
                  </span>

                  <button
                    onClick={() => increaseQty(item.id)}
                    className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                    title="زيادة الكمية"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                    title="إزالة المنتج"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {cart.length > 0 && (
        <motion.div
          className="mt-10 text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xl font-bold text-gray-700 dark:text-white">
            الإجمالي: <span className="text-blue-600">{total.toLocaleString()} د.ع</span>
          </p>

          <motion.button
            onClick={() => router.push("/checkout")}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition"
          >
            🧾 إتمام الطلب
          </motion.button>

          <motion.button
            onClick={() => {
              if (confirm("هل أنت متأكد من تفريغ السلة بالكامل؟")) {
                clearCart();
              }
            }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className="text-red-500 hover:text-red-600 underline text-sm"
          >
            🗑️ تفريغ السلة بالكامل
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
