import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import ReminderLog from "@/components/admin/ReminderLog";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function InstallmentDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      axios.get(`/api/installments/${id}`).then((res) => {
        setOrder(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleMarkInstallmentPaid = async (index: number) => {
    try {
      const res = await axios.post("/api/installments/mark-one", {
        orderId: id,
        installmentIndex: index,
      });
      if (res.data.success) {
        toast.success("✅ تم تسجيل القسط كمدفوع");
        setOrder((prev: any) => {
          const updated = { ...prev };
          updated.installments[index].paid = true;
          updated.installments[index].paidAt = new Date().toISOString();
          updated.paid += updated.installments[index].amount;
          return updated;
        });
      }
    } catch {
      toast.error("❌ حدث خطأ أثناء تسجيل الدفع");
    }
  };

  const handleSendReminder = async (index: number) => {
    const installment = order.installments[index];
    const message = `📅 تذكير: قسط مستحق بتاريخ ${new Date(installment.date).toLocaleDateString("ar-IQ")} بمبلغ ${installment.amount.toLocaleString()} د.ع`;

    try {
      const res = await axios.post("/api/whatsapp/send", {
        phone: order.phone,
        message,
        orderId: order._id,
        sentBy: user?.name || "مشرف",
      });

      if (res.data.success) {
        toast.success("📤 تم إرسال التذكير بنجاح");

        // ✅ تسجيل التذكير في Notification Log
        await axios.post("/api/installments/reminder", {
          orderId: order._id,
          customerPhone: order.phone,
          message,
          sentBy: user?.name || "مشرف",
          installmentIndex: index,
          type: "installment",
        });
      } else {
        toast.error("❌ فشل في إرسال التذكير");
      }
    } catch {
      toast.error("❌ حدث خطأ أثناء إرسال التذكير");
    }
  };

  if (loading) return <AdminLayout><p className="p-4">جاري تحميل البيانات...</p></AdminLayout>;
  if (!order) return <AdminLayout><p className="p-4">❌ لم يتم العثور على الطلب</p></AdminLayout>;

  const paidInstallments = order.installments.filter((i: any) => i.paid).length;
  const unpaidInstallments = order.installments.length - paidInstallments;

  const chartData = [
    { name: "مدفوع", value: paidInstallments },
    { name: "غير مدفوع", value: unpaidInstallments },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 p-4 border rounded bg-white">
        <h2 className="text-lg font-bold mb-2">🧾 سجل التذكيرات</h2>
        <ReminderLog orderId={order._id} />
      </div>

      <div className="mb-6 p-4 border rounded bg-white">
        <h2 className="text-lg font-bold mb-4">📊 ملخص الأقساط</h2>
        <p>عدد الأقساط: {order.installments.length}</p>
        <p>مدفوع: {paidInstallments}</p>
        <p>غير مدفوع: {unpaidInstallments}</p>

        <div className="w-full h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                <Cell fill="#4ade80" />
                <Cell fill="#f87171" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ كروت الموبايل */}
      <div className="grid gap-4 sm:hidden">
        {order.installments.map((item: any, index: number) => (
          <div key={index} className={`p-4 border rounded ${item.paid ? "bg-green-50" : "bg-red-50"}`}>
            <p className="font-bold">🧾 القسط {index + 1}</p>
            <p>📅 التاريخ: {new Date(item.date).toLocaleDateString("ar-IQ")}</p>
            <p>💰 المبلغ: {item.amount.toLocaleString()} د.ع</p>
            <p>📌 الحالة: {item.paid ? "✅ مدفوع" : "❌ غير مدفوع"}</p>
            {item.paidAt && <p>📆 تم الدفع: {new Date(item.paidAt).toLocaleDateString("ar-IQ")}</p>}
            {!item.paid && (
              <div className="flex gap-3 mt-2">
                <button onClick={() => handleMarkInstallmentPaid(index)} className="text-green-600 underline">💵 دفع</button>
                <button onClick={() => handleSendReminder(index)} className="text-blue-600 underline">📤 تذكير</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ✅ جدول لسطح المكتب */}
      <div className="hidden sm:block p-4 border rounded bg-white mt-6 overflow-x-auto">
        <h2 className="text-lg font-bold mb-2">📋 جدول الأقساط</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">تاريخ الاستحقاق</th>
              <th className="p-2 border">المبلغ</th>
              <th className="p-2 border">الحالة</th>
              <th className="p-2 border">تاريخ الدفع</th>
              <th className="p-2 border">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {order.installments.map((item: any, index: number) => (
              <tr key={index} className={item.paid ? "bg-green-50" : "bg-red-50"}>
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border text-center">{new Date(item.date).toLocaleDateString("ar-IQ")}</td>
                <td className="p-2 border text-center">{item.amount.toLocaleString()} د.ع</td>
                <td className="p-2 border text-center">{item.paid ? "✅ مدفوع" : "❌ غير مدفوع"}</td>
                <td className="p-2 border text-center">{item.paidAt ? new Date(item.paidAt).toLocaleDateString("ar-IQ") : "—"}</td>
                <td className="p-2 border text-center">
                  {!item.paid && (
                    <>
                      <button onClick={() => handleMarkInstallmentPaid(index)} className="text-green-600 hover:underline">💵 دفع</button>
                      <button onClick={() => handleSendReminder(index)} className="text-blue-600 hover:underline ml-2">📤 تذكير</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
