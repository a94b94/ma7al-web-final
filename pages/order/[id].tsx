"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Invoice from "@/components/Invoice";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface Order {
  _id: string;
  phone: string;
  customerName?: string;
  cart: { name: string; quantity: number; price: number }[];
  total: number;
  createdAt: string;
  type: "cash" | "installment";
  downPayment?: number;
  installmentsCount?: number;
  dueDate?: string;
  remaining?: number;
  paid?: number;
  discount?: number;
}

export default function OrderPage() {
  const router = useRouter();
  const { id } = router.query;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("اسم متجرك هنا");
  const [storeAddress, setStoreAddress] = useState("");

  const fetchOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("❌ فشل تحميل الطلب");
      const data = await res.json();
      setOrder(data.order || data);
    } catch (err: any) {
      setError(err.message || "⚠️ حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreInfo = async () => {
    try {
      const res = await fetch("/api/store-info");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStoreName(data.name || "اسم متجرك هنا");
      setStoreAddress(data.address || "");
    } catch {
      setStoreName("اسم متجرك هنا");
      setStoreAddress("");
    }
  };

  useEffect(() => {
    if (typeof id === "string") {
      setLoading(true);
      setError(null);
      fetchOrder(id);
      fetchStoreInfo();
    }
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:underline hover:text-blue-800"
        >
          <ArrowLeft size={20} />
          <span>رجوع</span>
        </button>

        <AnimatePresence>
          {loading ? (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-600 dark:text-gray-300"
            >
              ⏳ جاري تحميل الفاتورة...
            </motion.p>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-red-600 dark:text-red-400"
            >
              <p>{error}</p>
              <button
                onClick={() => id && typeof id === "string" && fetchOrder(id)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔁 إعادة المحاولة
              </button>
            </motion.div>
          ) : order ? (
            <motion.div
              key="invoice"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded shadow"
            >
              <Invoice
                invoiceNumber={order._id}
                date={new Date(order.createdAt).toLocaleDateString("ar-EG")}
                companyName={storeName}
                phone={order.phone}
                address={storeAddress}
                items={order.cart}
              />
            </motion.div>
          ) : (
            <motion.p
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 dark:text-gray-400"
            >
              📭 لم يتم العثور على الطلب
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
