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
import dynamic from "next/dynamic";
import Image from "next/image";
import Countdown from "react-countdown";

const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

export default function InstallmentDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (id) {
      axios.get(`/api/installments/${id}`).then((res) => {
        setOrder(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  const handleExportPDF = async () => {
    const html2pdfModule = await import("html2pdf.js");
    const element = document.getElementById("installments-pdf-section");
    if (!element) return;
    html2pdfModule.default()
      .from(element)
      .set({
        margin: 0.5,
        filename: `Installments_Report_${order._id}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  if (loading)
    return (
      <AdminLayout>
        <p className="p-4">جاري تحميل البيانات...</p>
      </AdminLayout>
    );
  if (!order)
    return (
      <AdminLayout>
        <p className="p-4">❌ لم يتم العثور على الطلب</p>
      </AdminLayout>
    );

  const paidInstallments = order.installments.filter((i: any) => i.paid).length;
  const unpaidInstallments = order.installments.length - paidInstallments;
  const nextDueDate = order.dueDate ? new Date(order.dueDate) : null;

  const chartData = [
    { name: "مدفوع", value: paidInstallments },
    { name: "غير مدفوع", value: unpaidInstallments },
  ];

  return (
    <AdminLayout>
      {/* ✅ بطاقة الزبون */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{order.customerName || "زبون"}</h2>
            <p className="text-sm">📱 {order.phone}</p>
          </div>
          <div className="text-center">
            <p className="text-xs">المتبقي</p>
            <p className="text-2xl font-bold text-yellow-200">
              {order.remaining?.toLocaleString()} د.ع
            </p>
          </div>
        </div>
        {nextDueDate && (
          <div className="mt-4">
            <p className="text-sm mb-1">⏳ الوقت المتبقي للاستحقاق:</p>
            <div className="text-lg font-mono">
              <Countdown date={nextDueDate} />
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 p-4 border rounded bg-white">
        <h2 className="text-lg font-bold mb-2">🧾 سجل التذكيرات</h2>
        <ReminderLog orderId={order._id} />
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={handleExportPDF}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          🖨️ تصدير الأقساط PDF
        </button>
      </div>

      <div id="installments-pdf-section" className="p-4 border rounded bg-white">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-3">
            <Image src={order.storeLogo || "/logo.png"} alt="Logo" width={50} height={50} />
            <h2 className="text-xl font-bold">{order.storeName || "متجري"}</h2>
          </div>
          <div className="text-sm text-right">
            <p>رقم الطلب: {order._id}</p>
            <p>اسم المشرف: {user?.name}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">📊 ملخص الأقساط</h3>
          <p>عدد الأقساط: {order.installments.length}</p>
          <p>مدفوع: {paidInstallments}</p>
          <p>غير مدفوع: {unpaidInstallments}</p>

          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#facc15" />
                </Pie>
                <Tooltip formatter={(value) => `${value} قسط`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border text-sm text-center">
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
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{new Date(item.date).toLocaleDateString("ar-IQ")}</td>
                  <td className="p-2 border">{item.amount.toLocaleString()} د.ع</td>
                  <td className="p-2 border">{item.paid ? "✅ مدفوع" : "❌ غير مدفوع"}</td>
                  <td className="p-2 border">
                    {item.paidAt ? new Date(item.paidAt).toLocaleDateString("ar-IQ") : "—"}
                  </td>
                  <td className="p-2 border">
                    {!item.paid && (
                      <button
                        onClick={() => handleMarkInstallmentPaid(index)}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        استلام قسط
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
