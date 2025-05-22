// الكود الكامل بعد إضافة زر التحليلات في الأعلى
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

type Installment = {
  date: string;
  amount: number;
  paid: boolean;
};

type Order = {
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
};

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
    const hasLateInstallment = order.installments?.some((i: any) => !i.paid && new Date(i.date) < new Date());
    if (filter === "paid") return remaining === 0;
    if (filter === "due") return remaining > 0;
    if (filter === "late") return hasLateInstallment;
    return true;
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-right">📋 قائمة الأقساط</h1>
        <Link
          href="/admin/dashboard"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          📊 لوحة التحليلات
        </Link>
      </div>

      <div className="mb-4 flex gap-2 justify-end">
        <button onClick={() => setFilter("all")} className="px-4 py-1 border rounded">الكل</button>
        <button onClick={() => setFilter("paid")} className="px-4 py-1 border rounded">مدفوع</button>
        <button onClick={() => setFilter("due")} className="px-4 py-1 border rounded">متبقي</button>
        <button onClick={() => setFilter("late")} className="px-4 py-1 border rounded">متأخر</button>
        <button onClick={handleAutoRemind} className="px-4 py-1 border rounded bg-blue-600 text-white">
          🔁 إرسال التذكيرات التلقائية
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">الهاتف</th>
              <th className="p-2 border">الاستحقاق</th>
              <th className="p-2 border">الكلي</th>
              <th className="p-2 border">المدفوع</th>
              <th className="p-2 border">المتبقي</th>
              <th className="p-2 border">الإشعار</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">أرسل بواسطة</th>
              <th className="p-2 border">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const remaining = order.total - (order.paid || 0);
              const monthly = order.installmentsCount
                ? Math.ceil((order.total - (order.downPayment || 0)) / order.installmentsCount)
                : 0;
              const hasLate = order.installments?.some((i: any) => !i.paid && new Date(i.date) < new Date());

              const message = `📅 تذكير: لديك قسط مستحق بتاريخ ${order.dueDate ? new Date(order.dueDate).toLocaleDateString("ar-IQ") : "—"} لدى متجر ${order.storeName}.
💰 المتبقي: ${remaining} د.ع ${
                monthly ? `\n📤 القسط الشهري: ${monthly} د.ع` : ""
              }\n📞 للاستفسار: ${order.phone}`;

              return (
                <tr key={order._id} className={hasLate ? "bg-red-100" : ""}>
                  <td className="p-2 border">{order.customerName || "—"}</td>
                  <td className="p-2 border">{order.phone || "—"}</td>
                  <td className="p-2 border">
                    {order.dueDate
                      ? new Date(order.dueDate).toLocaleDateString("ar-IQ")
                      : "—"}
                  </td>
                  <td className="p-2 border">{order.total}</td>
                  <td className="p-2 border">{order.paid || 0}</td>
                  <td className="p-2 border">{remaining}</td>
                  <td className="p-2 border">{order.reminderSent ? "✅" : "❌"}</td>
                  <td className="p-2 border">{remaining === 0 ? "مدفوع" : hasLate ? "متأخر" : "متبقي"}</td>
                  <td className="p-2 border">{order.sentBy || "—"}</td>
                  <td className="p-2 border space-y-1">
                    <Link href={`/admin/installments/${order._id}`} className="text-indigo-600 hover:underline block">
                      عرض الأقساط
                    </Link>

                    {!order.reminderSent && (
                      <button
                        className="text-blue-600 hover:underline block"
                        onClick={() =>
                          handleSendReminder(order._id, order.phone, message, user?.name || "مشرف")
                        }
                      >
                        إرسال تذكير
                      </button>
                    )}

                    {remaining > 0 && (
                      <button
                        className="text-green-600 hover:underline block"
                        onClick={() => handleMarkPaid(order._id)}
                      >
                        تم الدفع
                      </button>
                    )}

                    <button
                      className="text-orange-600 hover:underline block"
                      onClick={() => handleAddInstallment(order._id)}
                    >
                      إضافة قسط مدفوع
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
