"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import InvoicePreview from "@/components/InvoicePreview";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("اسم متجرك هنا");

  // جلب بيانات الطلب
  const fetchOrder = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) throw new Error("فشل تحميل الطلب");
      const data = await res.json();

      // دعم استجابة تكون مباشرة أو داخل حقل order
      setOrder(data.order || data);
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // جلب اسم المتجر من API منفصل
  const fetchStoreName = async () => {
    try {
      const res = await fetch("/api/store-info");
      if (!res.ok) throw new Error("فشل تحميل بيانات المتجر");
      const data = await res.json();
      setStoreName(data.name || "اسم متجرك هنا");
    } catch {
      setStoreName("اسم متجرك هنا");
    }
  };

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    fetchOrder(id);
    fetchStoreName();
  }, [id]);

  if (loading) return <p className="p-4 text-center">جاري التحميل...</p>;

  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => {
            if (id && typeof id === "string") fetchOrder(id);
          }}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          إعادة المحاولة
        </button>
      </div>
    );

  if (!order) return <p className="p-4 text-center">لم يتم العثور على الطلب</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow my-8">
      <InvoicePreview order={order} storeName={storeName} />
    </div>
  );
}
