import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import * as XLSX from "xlsx";
import ReminderLog from "@/components/admin/ReminderLog";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, XAxis, YAxis, Bar, CartesianGrid, Legend } from "recharts";

export default function InstallmentDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("installment_filter") as any) || "all";
    }
    return "all";
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("installment_sort") as any) || "asc";
    }
    return "asc";
  });

  useEffect(() => {
    if (id) {
      axios.get(`/api/installments/${id}`).then((res) => {
        setOrder(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  useEffect(() => {
    localStorage.setItem("installment_filter", filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem("installment_sort", sortOrder);
  }, [sortOrder]);

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
      } else toast.error("❌ فشل في التحديث");
    } catch {
      toast.error("⚠️ خطأ أثناء الحفظ");
    }
  };

  const handleSendReminder = async (index: number) => {
    const installment = order.installments[index];
    const message = `📅 تذكير بقسط مستحق بتاريخ ${new Date(installment.date).toLocaleDateString("ar-IQ")} بقيمة ${installment.amount.toLocaleString()} د.ع\nالرجاء السداد في أقرب وقت ممكن.\n📞 ${order.storeName}`;
    try {
      await axios.post("/api/whatsapp/send", {
        phone: order.phone,
        message,
        orderId: order._id,
        sentBy: user?.name || "مشرف",
      });

      await axios.post("/api/notifications/log", {
        orderId: order._id,
        message,
        sentBy: user?.name || "مشرف",
        phone: order.phone,
        type: "installment-reminder",
        installmentIndex: index,
      });

      toast.success("✅ تم إرسال التذكير وتسجيله في السجل");
    } catch {
      toast.error("❌ فشل في إرسال التذكير أو تسجيله");
    }
  };

  const filteredInstallments = (order?.installments || [])
    .filter((item: any) => {
      if (filter === "paid") return item.paid;
      if (filter === "unpaid") return !item.paid;
      return true;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const totalInstallments = order?.installments?.length || 0;
  const paidInstallments = order?.installments?.filter((i: any) => i.paid).length || 0;
  const unpaidInstallments = totalInstallments - paidInstallments;
  const totalPaidAmount = order?.paid || 0;
  const totalRemainingAmount = (order?.total || 0) - totalPaidAmount;

  const now = new Date();
  const last7 = new Date(now);
  last7.setDate(now.getDate() - 7);
  const last30 = new Date(now);
  last30.setDate(now.getDate() - 30);

  const paidInLast7 = order?.installments?.filter((i: any) => i.paid && i.paidAt && new Date(i.paidAt) >= last7)
    .reduce((sum: number, i: any) => sum + i.amount, 0) || 0;
  const paidInLast30 = order?.installments?.filter((i: any) => i.paid && i.paidAt && new Date(i.paidAt) >= last30)
    .reduce((sum: number, i: any) => sum + i.amount, 0) || 0;

  const chartData = [
    { name: "مدفوع", value: paidInstallments },
    { name: "غير مدفوع", value: unpaidInstallments },
  ];

  const monthlyTotals: Record<string, number> = {};
  order?.installments?.forEach((i: any) => {
    if (i.paid && i.paidAt) {
      const month = new Date(i.paidAt).toLocaleDateString("ar-IQ", { year: "numeric", month: "short" });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + i.amount;
    }
  });

  const barData = Object.keys(monthlyTotals).map((month) => ({ month, amount: monthlyTotals[month] }));

  const COLORS = ["#4ade80", "#f87171"];

  return (
    <AdminLayout>
      <div className="mb-6 p-4 border rounded bg-white">
        <h2 className="text-lg font-bold mb-2">🧾 سجل التذكيرات</h2>
        <ReminderLog orderId={order?._id} />
      </div>

      <div className="mb-6 p-4 border rounded bg-white">
        <h2 className="text-lg font-bold mb-2">📊 ملخص الأقساط</h2>
        <p>عدد الأقساط: {totalInstallments}</p>
        <p>المدفوعة: {paidInstallments}</p>
        <p>غير المدفوعة: {unpaidInstallments}</p>
        <p>الإجمالي المدفوع: {totalPaidAmount.toLocaleString()} د.ع</p>
        <p>المتبقي: {totalRemainingAmount.toLocaleString()} د.ع</p>
        <p>🔹 المدفوع خلال آخر 7 أيام: {paidInLast7.toLocaleString()} د.ع</p>
        <p>🔹 المدفوع خلال آخر 30 يوم: {paidInLast30.toLocaleString()} د.ع</p>

        <div className="w-full h-64 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {barData.length > 0 && (
          <div className="w-full h-72 mt-10">
            <h3 className="text-base font-semibold mb-2">📈 المدفوعات حسب الشهر</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="p-4 border rounded bg-white">
        <h2 className="text-lg font-bold mb-4">📋 جدول الأقساط</h2>
        <table className="w-full text-sm border">
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
            {filteredInstallments.map((item: any, index: number) => (
              <tr key={index} className={item.paid ? "bg-green-50" : "bg-red-50"}>
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border text-center">{new Date(item.date).toLocaleDateString("ar-IQ")}</td>
                <td className="p-2 border text-center">{item.amount.toLocaleString()} د.ع</td>
                <td className="p-2 border text-center">{item.paid ? "✅ مدفوع" : "❌ غير مدفوع"}</td>
                <td className="p-2 border text-center">{item.paidAt ? new Date(item.paidAt).toLocaleDateString("ar-IQ") : "—"}</td>
                <td className="p-2 border text-center space-x-2 rtl:space-x-reverse">
                  {!item.paid && (
                    <>
                      <button
                        onClick={() => handleMarkInstallmentPaid(index)}
                        className="text-green-600 hover:underline"
                      >
                        💵 دفع
                      </button>
                      <button
                        onClick={() => handleSendReminder(index)}
                        className="text-blue-600 hover:underline"
                      >
                        📤 تذكير
                      </button>
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
