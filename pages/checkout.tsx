"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const groupedByStore = cart.reduce((acc: any, item) => {
    const storeId = item.storeId || "unknown";
    if (!acc[storeId]) acc[storeId] = [];
    acc[storeId].push(item);
    return acc;
  }, {});

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
        body: JSON.stringify({
          phone,
          address,
          paymentMethod,
          cart,
        }),
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

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🛒 إتمام الطلب</h1>

      <input
        type="tel"
        placeholder="📱 رقم الهاتف"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg"
      />

      <textarea
        placeholder="📍 العنوان الكامل"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full p-3 mb-4 border rounded-lg"
      />

      <div className="space-y-2 mb-6">
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
      </div>

      <div className="mb-4 text-right font-bold text-lg text-blue-600">
        الإجمالي: {totalAmount.toLocaleString()} د.ع
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-full transition"
      >
        {loading ? "⏳ جاري تأكيد الطلب..." : "✅ تأكيد الطلب"}
      </button>
    </div>
  );
}
