// pages/admin/installments/[id].tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import dynamic from "next/dynamic";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";

const html2pdf = dynamic(() => import("html2pdf.js"), { ssr: false });

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
      const res = await axios.post("/api/installments/mark-one", {
        orderId: id,
        installmentIndex: selectedInstallmentIndex,
      });

      if (res.data.success) {
        const newPaidAt = new Date().toISOString();
        const paidAmount = res.data.amount;
        const newRemaining = res.data.remaining;

        setOrder((prev: any) => {
          const updated = { ...prev };
          updated.installments[selectedInstallmentIndex].paid = true;
          updated.installments[selectedInstallmentIndex].paidAt = newPaidAt;
          updated.paid = res.data.paid;
          updated.remaining = newRemaining;
          return updated;
        });

        const confirmMessage = `*✅ تأكيد دفع قسط*\n\n*الاسم:* ${order.customerName}\n*المبلغ المدفوع:* ${paidAmount.toLocaleString()} د.ع\n*التاريخ:* ${new Date().toLocaleString("ar-IQ")}\n*المتبقي:* ${newRemaining.toLocaleString()} د.ع`;

        await axios.post("/api/whatsapp/send", {
          phone: order.phone,
          message: confirmMessage,
          orderId: order._id,
          sentBy: user?.name || "مشرف",
        });

        if (newRemaining <= 0) {
          const element = document.createElement("div");
          element.innerHTML = `
            <div dir='rtl' style='font-family: sans-serif; padding: 20px;'>
              <h2 style='text-align:center;'>🧾 فاتورة السداد النهائية</h2>
              <p>الزبون: ${order.customerName}</p>
              <p>الهاتف: ${order.phone}</p>
              <p>المبلغ الكلي: ${order.total.toLocaleString()} د.ع</p>
              <p>المدفوع: ${order.paid.toLocaleString()} د.ع</p>
              <p>الحالة: مكتمل</p>
              <p>تاريخ السداد النهائي: ${new Date().toLocaleDateString("ar-IQ")}</p>
            </div>
          `;
          const module = await import("html2pdf.js");
          module.default().from(element).set({ filename: `Final_Installment_Receipt.pdf` }).save();
        }

        setShowModal(false);
        toast.success("✅ تم تسجيل القسط");
      } else {
        toast.error("❌ فشل في تسجيل القسط");
      }
    } catch {
      toast.error("❌ حدث خطأ أثناء العملية");
    }

    setSending(false);
  };

  const exportPaymentLog = async () => {
    if (!order) return;
    const element = document.createElement("div");
    const paidInstallments = order.installments?.filter((i: any) => i.paid) || [];
    element.innerHTML = `
      <div dir='rtl' style='font-family: sans-serif; padding: 20px;'>
        <h2 style='text-align:center;'>📄 سجل الدفع الكامل</h2>
        <p>الزبون: ${order.customerName}</p>
        <p>الهاتف: ${order.phone}</p>
        <ul>
          ${paidInstallments
            .map(
              (i: any) =>
                `<li>✅ دفع ${i.amount.toLocaleString()} د.ع بتاريخ ${new Date(i.paidAt).toLocaleDateString("ar-IQ")}</li>`
            )
            .join("")}
        </ul>
      </div>
    `;
    const module = await import("html2pdf.js");
    module.default().from(element).set({ filename: `Installment_Payment_Log.pdf` }).save();
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
            <p className="mb-2">التاريخ: {new Date(order.installments[selectedInstallmentIndex].date).toLocaleDateString("ar-IQ")}</p>
            <p className="mb-4">المبلغ: {order.installments[selectedInstallmentIndex].amount.toLocaleString()} د.ع</p>
            <div className="flex flex-wrap justify-end gap-2">
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

      {!loading && order && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 bg-white rounded-xl mt-6 border"
        >
          <h2 className="text-xl font-bold mb-4">📋 تفاصيل الأقساط</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-center border">
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

          <div className="mt-8">
            <h3 className="text-lg font-bold mb-2">📄 سجل الدفع الكامل</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {order.installments?.filter((i: any) => i.paid).map((i: any, idx: number) => (
                <li key={idx}>
                  ✅ دفع {i.amount.toLocaleString()} د.ع بتاريخ {new Date(i.paidAt).toLocaleDateString("ar-IQ")}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-right">
              <button
                onClick={exportPaymentLog}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                🖨️ تحميل سجل الدفع PDF
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AdminLayout>
  );
}
