// الكود الأساسي
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

// ✅ نافذة استلام قسط
import Modal from "@/components/ui/Modal"; // تأكد من وجود هذا المكون أو أنشئ واحد بسيط

export default function InstallmentDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] = useState<number | null>(null);

  const handleMarkInstallmentPaid = async () => {
  if (selectedInstallmentIndex === null) return;

  try {
    const installment = order.installments[selectedInstallmentIndex];

    // 1. إرسال إشعار واتساب قبل الدفع
    const reminderMessage = `تحية طيبة عزيزي المشترك ${order.customerName}
قسط مستحق بقيمة ${installment.amount.toLocaleString()} د.ع
بتاريخ ${new Date(installment.date).toLocaleDateString("ar-IQ")}`;

    const whatsappRes = await axios.post("/api/whatsapp/send", {
      phone: order.phone,
      message: reminderMessage,
      orderId: order._id,
      sentBy: user?.name || "مشرف",
    });

    if (!whatsappRes.data.success) {
      toast.error("❌ فشل في إرسال رسالة الواتساب، لم يتم تسجيل القسط");
      return;
    }

    // 2. تسجيل القسط بعد نجاح الإرسال
    const res = await axios.post("/api/installments/mark-one", {
      orderId: id,
      installmentIndex: selectedInstallmentIndex,
    });

    if (res.data.success) {
      const newPaidAt = new Date().toISOString();
      const paidAmount = installment.amount;
      const newRemaining = order.remaining - paidAmount;

      // 3. تحديث الحالة محليًا
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

      // 4. إشعار تأكيد الدفع
      const formattedDate = new Date().toLocaleString("ar-IQ", {
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      const confirmMessage = `تحية طيبة عزيزي المشترك ${order.customerName}
لقد قمت بدفع ${paidAmount.toLocaleString()} د.ع بتاريخ ${formattedDate}
الدين المتبقي: ${newRemaining.toLocaleString()} د.ع`;

      await axios.post("/api/whatsapp/send", {
        phone: order.phone,
        message: confirmMessage,
        orderId: order._id,
        sentBy: user?.name || "مشرف",
      });
    } else {
      toast.error("❌ فشل في تسجيل القسط");
    }
  } catch (err) {
    toast.error("❌ حدث خطأ أثناء العملية");
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

  //... (الباقي بدون تغيير)

  return (
    <AdminLayout>
      {/* ... (المحتوى السابق بالكامل) */}

      {/* ✅ نافذة الاستلام */}
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
                className="bg-green-600 text-white px-4 py-2 rounded"
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
    </AdminLayout>
  );
}
