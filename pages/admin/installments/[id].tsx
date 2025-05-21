// الكود الكامل بعد التعديل النهائي
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
import Modal from "@/components/ui/Modal";

export default function InstallmentDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const handleMarkInstallmentPaid = async () => {
    if (selectedInstallmentIndex === null) return;
    setSending(true);

    try {
      const installment = order.installments[selectedInstallmentIndex];

      const formattedDate = new Date().toLocaleString("ar-IQ", {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      const paidAmount = installment.amount;
      const newRemaining = order.remaining - paidAmount;

      const confirmMessage = `*✅ تأكيد دفع قسط*\n\n*الاسم:* ${order.customerName}\n*المبلغ المدفوع:* ${paidAmount.toLocaleString()} د.ع\n*التاريخ:* ${formattedDate}\n*المتبقي:* ${newRemaining.toLocaleString()} د.ع\n\n📌 شكراً لتسديدك، نأمل التزامك بالمواعيد القادمة.`;

      const whatsappRes = await axios.post("/api/whatsapp/send", {
        phone: order.phone,
        message: confirmMessage,
        orderId: order._id,
        sentBy: user?.name || "مشرف",
      });

      if (!whatsappRes.data.success) {
        toast.error("❌ فشل في إرسال رسالة الواتساب، لم يتم تسجيل القسط");
        setSending(false);
        return;
      }

      const res = await axios.post("/api/installments/mark-one", {
        orderId: id,
        installmentIndex: selectedInstallmentIndex,
      });

      if (res.data.success) {
        const newPaidAt = new Date().toISOString();

        setOrder((prev: any) => {
          const updated = { ...prev };
          updated.installments[selectedInstallmentIndex].paid = true;
          updated.installments[selectedInstallmentIndex].paidAt = newPaidAt;
          updated.paid += paidAmount;
          updated.remaining = newRemaining;
          return updated;
        });

        setShowModal(false);
        toast.success("✅ تم تسجيل القسط وإرسال الإشعار");
      } else {
        toast.error("❌ فشل في تسجيل القسط");
      }
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء العملية");
    }

    setSending(false);
  };

  useEffect(() => {
    if (id) {
      axios.get(`/api/installments/${id}`).then((res) => {
        setOrder(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  return (
    <AdminLayout>
      {showModal && selectedInstallmentIndex !== null && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">🧾 تأكيد استلام القسط</h2>
            <p className="mb-2">
              التاريخ: {new Date(order.installments[selectedInstallmentIndex].date).toLocaleDateString("ar-IQ")}
            </p>
            <p className="mb-4">
              المبلغ: {order.installments[selectedInstallmentIndex].amount.toLocaleString()} د.ع
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={async () => {
                  const element = document.createElement("div");
                  element.innerHTML = `
                    <div dir='rtl' style='font-family: sans-serif; padding: 20px;'>
                      <h2>وصل استلام قسط</h2>
                      <p>الزبون: ${order.customerName}</p>
                      <p>الهاتف: ${order.phone}</p>
                      <p>المبلغ: ${order.installments[selectedInstallmentIndex].amount.toLocaleString()} د.ع</p>
                      <p>التاريخ: ${new Date().toLocaleDateString("ar-IQ")}</p>
                    </div>
                  `;
                  const module = await import("html2pdf.js");
                  module.default().from(element).set({ filename: `Installment_Receipt.pdf` }).save();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                🖨️ طباعة وصل
              </button>
              <button
                onClick={handleMarkInstallmentPaid}
                disabled={sending}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                ✅ تأكيد الاستلام
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ✅ عرض الأقساط */}
      {!loading && order && (
        <div className="p-4 bg-white rounded-xl mt-6 border">
          <h2 className="text-xl font-bold mb-4">📋 تفاصيل الأقساط</h2>

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
              {order.installments?.map((item: any, index: number) => (
                <tr key={index} className={item.paid ? "bg-green-50" : "bg-red-50"}>
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{new Date(item.date).toLocaleDateString("ar-IQ")}</td>
                  <td className="p-2 border">{item.amount.toLocaleString()} د.ع</td>
                  <td className="p-2 border">{item.paid ? "✅ مدفوع" : "❌ غير مدفوع"}</td>
                  <td className="p-2 border">{item.paidAt ? new Date(item.paidAt).toLocaleDateString("ar-IQ") : "—"}</td>
                  <td className="p-2 border">
                    {!item.paid && (
                      <button
                        onClick={() => {
                          setSelectedInstallmentIndex(index);
                          setShowModal(true);
                        }}
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
      )}
    </AdminLayout>
  );
}
