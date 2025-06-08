"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async () => {
    if (!phone.trim() || !address.trim()) {
      toast.error("يرجى إدخال رقم الهاتف والعنوان.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address, paymentMethod, cart }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ تم إرسال الطلبات بنجاح!");
        clearCart();
        router.push("/");
      } else {
        toast.error(data.error || "حدث خطأ أثناء إرسال الطلب.");
      }
    } catch {
      toast.error("❌ فشل الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* زر رجوع */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:underline"
      >
        <ArrowLeft size={18} />
        <span>رجوع</span>
      </button>

      <motion.h1
        className="text-2xl font-bold mb-6 text-gray-800 dark:text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🛒 إتمام الطلب
      </motion.h1>

      <motion.input
        type="tel"
        placeholder="📱 رقم الهاتف"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      />

      <motion.textarea
        placeholder="📍 العنوان الكامل"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      />

      <motion.div
        className="space-y-2 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <label className="flex items-center gap-3">
          <input
            type="radio"
            name="payment"
            value="cash"
            checked={paymentMethod === "cash"}
            onChange={() => setPaymentMethod("cash")}
            className="w-4 h-4"
          />
          <span>الدفع عند الاستلام</span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="radio"
            name="payment"
            value="card"
            checked={paymentMethod === "card"}
            onChange={() => setPaymentMethod("card")}
            className="w-4 h-4"
            disabled
          />
          <span className="text-gray-400">بطاقة إلكترونية (قريبًا)</span>
        </label>
      </motion.div>

      <motion.div
        className="mb-4 text-right font-bold text-lg text-blue-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        الإجمالي: {totalAmount.toLocaleString()} د.ع
      </motion.div>

      <motion.button
        onClick={handleSubmit}
        disabled={loading}
        whileTap={{ scale: 0.97 }}
        whileHover={{ scale: 1.02 }}
        className={`w-full text-white py-3 rounded-full transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "⏳ جاري تأكيد الطلب..." : "✅ تأكيد الطلب"}
      </motion.button>
    </motion.div>
  );
}
