import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/context/UserContext"; // ✅ جلب اسم المشرف

export default function InstallmentsPage() {
  const { user } = useUser(); // ✅ اسم المشرف الحالي
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState<"all" | "paid" | "due">("all");

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
        alert("✅ تم إرسال التذكير بنجاح");
      } else {
        alert("❌ فشل في إرسال الرسالة");
      }
    } catch (err) {
      alert("❌ حدث خطأ أثناء الإرسال");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const remaining = order.total - (order.paid || 0);
    if (filter === "paid") return remaining === 0;
    if (filter === "due") return remaining > 0;
    return true;
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">قائمة الأقساط</h1>

      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilter("all")} className="px-4 py-1 border rounded">الكل</button>
        <button onClick={() => setFilter("paid")} className="px-4 py-1 border rounded">مدفوع</button>
        <button onClick={() => setFilter("due")} className="px-4 py-1 border rounded">متبقي</button>
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
              const message = `📅 تذكير: لديك قسط مستحق بتاريخ ${new Date(order.dueDate).toLocaleDateString("ar-IQ")} لدى متجر ${order.storeName}.`;
              return (
                <tr key={order._id}>
                  <td className="p-2 border">{order.customerName || "—"}</td>
                  <td className="p-2 border">{order.phone || "—"}</td>
                  <td className="p-2 border">
                    {order.dueDate ? new Date(order.dueDate).toLocaleDateString("ar-IQ") : "—"}
                  </td>
                  <td className="p-2 border">{order.total}</td>
                  <td className="p-2 border">{order.paid || 0}</td>
                  <td className="p-2 border">{remaining}</td>
                  <td className="p-2 border">
                    {order.reminderSent ? "✅" : "❌"}
                  </td>
                  <td className="p-2 border">
                    {remaining === 0 ? "مدفوع" : "متبقي"}
                  </td>
                  <td className="p-2 border">
                    {order.sentBy || "—"}
                  </td>
                  <td className="p-2 border">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() =>
                        handleSendReminder(order._id, order.phone, message, user?.name || "مشرف")
                      }
                    >
                      إرسال تذكير
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
