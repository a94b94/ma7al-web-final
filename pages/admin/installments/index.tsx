"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { motion } from "framer-motion";

interface Installment {
  date: string;
  amount: number;
  paid: boolean;
}

interface Order {
  _id: string;
  customerName?: string;
  phone: string;
  total: number;
  paid: number;
  dueDate?: string;
  installments?: Installment[];
  installmentsCount?: number;
  downPayment?: number;
  reminderSent?: boolean;
  sentBy?: string;
  storeName: string;
}

export default function InstallmentsPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | "paid" | "due" | "late">("all");

  useEffect(() => {
    axios.get("/api/installments").then((res) => {
      setOrders(res.data);
    });
  }, []);

  const handleSendReminder = async (orderId: string, phone: string, message: string, sentBy: string) => {
    try {
      const res = await axios.post("/api/whatsapp/send", {
        phone,
        message,
        orderId,
        sentBy,
      });

      if (res.data.success) {
        await axios.post("/api/installments/reminder", { orderId });
        alert("✅ تم إرسال التذكير وتحديث حالته");
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, reminderSent: true } : o))
        );
      } else {
        alert("❌ فشل في إرسال الرسالة");
      }
    } catch {
      alert("❌ حدث خطأ أثناء الإرسال");
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    if (!confirm("هل تريد تأكيد تسديد كامل المبلغ؟")) return;
    try {
      await axios.post("/api/installments/mark-paid", { orderId });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, paid: o.total, reminderSent: false } : o
        )
      );
    } catch {
      alert("❌ فشل في تحديث الدفع");
    }
  };

  const handleAddInstallment = async (orderId: string) => {
    try {
      const res = await axios.post("/api/installments/add-installment", { orderId });
      if (res.data.success) {
        alert("✅ تم تسجيل القسط المدفوع");
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, paid: o.paid + res.data.amount } : o
          )
        );
      } else {
        alert("❌ لم يتم التحديث");
      }
    } catch {
      alert("❌ حدث خطأ أثناء إضافة القسط");
    }
  };

  const handleAutoRemind = async () => {
    const res = await fetch("/api/installments/auto-remind", { method: "POST" });
    const data = await res.json();
    if (data.success) alert(`📤 تم إرسال ${data.count} تذكير`);
    else alert("❌ فشل في إرسال التذكيرات التلقائية");
  };

  const filteredOrders = orders.filter((order) => {
    const remaining = order.total - (order.paid || 0);
    const hasLateInstallment = order.installments?.some((i) => !i.paid && new Date(i.date) < new Date());
    if (filter === "paid") return remaining === 0;
    if (filter === "due") return remaining > 0;
    if (filter === "late") return hasLateInstallment;
    return true;
  });

  const totalPaid = filteredOrders.reduce((acc, order) => acc + (order.paid || 0), 0);
  const totalRemaining = filteredOrders.reduce((acc, order) => acc + (order.total - (order.paid || 0)), 0);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-right">📋 قائمة الأقساط</h1>
          <Link
            href="/admin/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
          >
            📊 لوحة التحليلات
          </Link>
        </div>

        <div className="mb-2 text-xs sm:text-sm text-gray-700 font-medium flex flex-col sm:flex-row gap-2 justify-end">
          <div>✅ مجموع المدفوع: {totalPaid.toLocaleString("ar-IQ")} د.ع</div>
          <div>⏳ مجموع المتبقي: {totalRemaining.toLocaleString("ar-IQ")} د.ع</div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 justify-end">
          <button onClick={() => setFilter("all")} className="px-3 py-1 border rounded text-sm">الكل</button>
          <button onClick={() => setFilter("paid")} className="px-3 py-1 border rounded text-sm">مدفوع</button>
          <button onClick={() => setFilter("due")} className="px-3 py-1 border rounded text-sm">متبقي</button>
          <button onClick={() => setFilter("late")} className="px-3 py-1 border rounded text-sm">متأخر</button>
          <button onClick={handleAutoRemind} className="px-3 py-1 border rounded bg-blue-600 text-white text-sm">
            🔁 إرسال التذكيرات التلقائية
          </button>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.map((order) => {
          const remaining = order.total - (order.paid || 0);
          const hasLate = order.installments?.some((i) => !i.paid && new Date(i.date) < new Date());
          const message = `📅 تذكير: لديك قسط مستحق بتاريخ ${order.dueDate || "غير محدد"} لدى متجر ${order.storeName}\n💰 المتبقي: ${remaining.toLocaleString("ar-IQ")} د.ع`;

          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`rounded-xl shadow-md border p-4 ${hasLate ? "bg-red-50 border-red-300" : "bg-white"}`}
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-base">{order.customerName || "—"}</h2>
                <div className={`text-xs px-2 py-1 rounded-full ${remaining === 0 ? "bg-green-100 text-green-700" : hasLate ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-800"}`}>
                  {remaining === 0 ? "مدفوع" : hasLate ? "متأخر" : "متبقي"}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-1">📞 {order.phone}</p>
              <p className="text-sm text-gray-600 mb-1">
                💰 الكلي: {order.total.toLocaleString("ar-IQ")} | المدفوع: {order.paid.toLocaleString("ar-IQ")} | المتبقي: {remaining.toLocaleString("ar-IQ")}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                📅 تاريخ الاستحقاق: {order.dueDate ? new Date(order.dueDate).toLocaleDateString("ar-IQ") : "—"}
              </p>

              <div className="flex flex-col gap-1 text-sm">
                <Link href={`/admin/installments/${order._id}`} className="text-indigo-600 hover:underline">
                  عرض الأقساط
                </Link>

                {!order.reminderSent && remaining > 0 && (
                  <button
                    className="text-blue-600 hover:underline text-right"
                    onClick={() => handleSendReminder(order._id, order.phone, message, user?.name || "مشرف")}
                  >
                    إرسال تذكير
                  </button>
                )}

                {remaining > 0 && (
                  <>
                    <button
                      className="text-green-600 hover:underline text-right"
                      onClick={() => handleMarkPaid(order._id)}
                    >
                      تم الدفع
                    </button>
                    <button
                      className="text-orange-600 hover:underline text-right"
                      onClick={() => handleAddInstallment(order._id)}
                    >
                      إضافة قسط مدفوع
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
