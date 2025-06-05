"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Invoice from "@/components/Invoice"; // ✅ مكون الفاتورة

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

  if (loading) return <p className="p-4 text-center">⏳ جاري التحميل...</p>;

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => id && typeof id === "string" && fetchOrder(id)}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
        >
          🔁 إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!order) return <p className="p-4 text-center">📭 لم يتم العثور على الطلب</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow my-8">
      <Invoice
        invoiceNumber={order._id}
        date={new Date(order.createdAt).toLocaleDateString("ar-EG")}
        companyName={storeName}
        phone={order.phone}
        address={storeAddress}
        items={order.cart}
      />
    </div>
  );
}
