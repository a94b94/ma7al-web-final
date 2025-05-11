import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { useUser } from "@/context/UserContext";
import * as XLSX from "xlsx";
import ReminderLog from "@/components/admin/ReminderLog";

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

  const handleResetFilters = () => {
    setFilter("all");
    setSortOrder("asc");
    localStorage.removeItem("installment_filter");
    localStorage.removeItem("installment_sort");
  };

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

  const handleUnmarkInstallmentPaid = async (index: number) => {
    try {
      const res = await axios.post("/api/installments/unmark-one", {
        orderId: id,
        installmentIndex: index,
      });
      if (res.data.success) {
        toast.success("✅ تم إلغاء دفع القسط");
        setOrder((prev: any) => {
          const updated = { ...prev };
          updated.installments[index].paid = false;
          updated.installments[index].paidAt = undefined;
          updated.paid -= updated.installments[index].amount;
          return updated;
        });
      } else toast.error("❌ فشل في التحديث");
    } catch {
      toast.error("⚠️ خطأ أثناء الإلغاء");
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
        sentBy: user?.name || "مشرف"
      });

      await axios.post("/api/notifications/log", {
        orderId: order._id,
        message,
        sentBy: user?.name || "مشرف",
        phone: order.phone,
        type: "installment-reminder",
        installmentIndex: index
      });

      toast.success("✅ تم إرسال التذكير وتسجيله في السجل");
    } catch {
      toast.error("❌ فشل في إرسال التذكير أو تسجيله");
    }
  };

  const handlePrintReport = async () => {
    const element = document.getElementById("installment-report");
    if (element) {
      const html2pdf = (await import("html2pdf.js")).default;
      html2pdf()
        .from(element)
        .set({
          margin: 0.5,
          filename: `تقرير-الأقساط-${order.customerName}.pdf`,
          html2canvas: { scale: 2 }
        })
        .save();
    }
  };

  const handleExportToExcel = () => {
    const filtered = filteredInstallments.map((item: any, index: number) => ({
      "#": index + 1,
      "تاريخ الاستحقاق": new Date(item.date).toLocaleDateString("ar-IQ"),
      "المبلغ": item.amount,
      "الحالة": item.paid ? "مدفوع" : "غير مدفوع",
      "تاريخ الدفع": item.paidAt ? new Date(item.paidAt).toLocaleDateString("ar-IQ") : "—",
    }));
    const worksheet = XLSX.utils.json_to_sheet(filtered);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Installments");
    XLSX.writeFile(workbook, `تقرير-الأقساط-${order.customerName}.xlsx`);
  };

  if (loading) return <AdminLayout><p>🔄 جاري التحميل...</p></AdminLayout>;
  if (!order) return <AdminLayout><p>❌ لم يتم العثور على الفاتورة</p></AdminLayout>;

  const totalInstallments = order.installments?.length || 0;
  const paidInstallments = order.installments?.filter((i: any) => i.paid).length || 0;
  const unpaidInstallments = totalInstallments - paidInstallments;
  const totalPaidAmount = order.paid || 0;
  const totalRemainingAmount = (order.total || 0) - totalPaidAmount;
  const today = new Date().toLocaleDateString("ar-IQ");
  const logo = order.storeLogo || user?.storeLogo;

  const filteredInstallments = (order.installments || [])
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

  return (
    <AdminLayout>
      <div className="mb-6 p-4 border rounded bg-white">
        <h2 className="text-lg font-bold mb-2">🧾 سجل التذكيرات</h2>
        <ReminderLog orderId={order._id} />
      </div>
      {/* باقي الكود للجدول والتفاصيل هنا */}
    </AdminLayout>
  );
}
