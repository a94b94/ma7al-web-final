"use client";

import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus } from "lucide-react";
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
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        🛒 سلة الشراء
      </h1>

      {cart.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-300">
          سلتك فارغة حالياً.
        </p>
      ) : (
        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
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
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image || "/no-image.png"}
                  alt={item.name}
                  title={item.name}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-blue-600 font-semibold">
                    {item.price.toLocaleString()} د.ع
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-bold text-gray-800 dark:text-white">
                  {item.quantity || 1}
                </span>
                <button
                  onClick={() => increaseQty(item.id)}
                  className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {cart.length > 0 && (
        <div className="mt-10 text-center space-y-4">
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

          <button
            onClick={() => {
              if (confirm("هل أنت متأكد من تفريغ السلة بالكامل؟")) {
                clearCart();
              }
            }}
            className="text-red-500 hover:text-red-600 underline text-sm"
          >
            🗑️ تفريغ السلة بالكامل
          </button>
        </div>
      )}
    </div>
  );
}
