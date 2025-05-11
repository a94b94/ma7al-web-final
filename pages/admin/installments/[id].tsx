import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import { useUser } from "@/context/UserContext";
import * as XLSX from "xlsx";

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

  const handlePrintReport = () => {
    const element = document.getElementById("installment-report");
    if (element) {
      html2pdf().from(element).set({ margin: 0.5, filename: `تقرير-الأقساط-${order.customerName}.pdf`, html2canvas: { scale: 2 } }).save();
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
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🧾 تفاصيل الأقساط للزبون: {order.customerName}</h1>
        <button
          onClick={() => router.push("/admin/installments")}
          className="text-sm text-blue-600 underline"
        >
          ← رجوع للقائمة
        </button>
      </div>

      <p className="mb-2">📞 {order.phone}</p>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={handlePrintReport} className="bg-blue-600 text-white px-4 py-2 rounded">
          🖨️ طباعة التقرير PDF
        </button>
        <button onClick={handleExportToExcel} className="bg-green-600 text-white px-4 py-2 rounded">
          📥 تصدير إلى Excel
        </button>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border p-2 rounded text-sm"
        >
          <option value="all">عرض الكل</option>
          <option value="paid">المدفوعة فقط</option>
          <option value="unpaid">غير المدفوعة فقط</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          className="border p-2 rounded text-sm"
        >
          <option value="asc">ترتيب: من الأقدم</option>
          <option value="desc">ترتيب: من الأحدث</option>
        </select>
        <button
          onClick={handleResetFilters}
          className="bg-gray-300 text-black px-3 py-2 rounded text-sm"
        >
          🔄 إعادة تعيين الفلاتر
        </button>
      </div>

      <div id="installment-report" className="mb-4 bg-white p-6 rounded shadow text-sm">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold mb-2">🧾 تقرير الأقساط</h2>
          <p>التاريخ: <strong>{today}</strong></p>
          <p>الاسم: <strong>{order.customerName}</strong></p>
          <p>الهاتف: <strong>{order.phone}</strong></p>
          <div className="flex justify-center items-center gap-2">
            {logo && <img src={logo} alt="logo" className="h-12" />}
            <p className="text-lg font-semibold">{order.storeName || "—"}</p>
          </div>
          <hr className="my-2" />
        </div>
        <p>📌 عدد الأقساط الكلي: <strong>{totalInstallments}</strong></p>
        <p>✅ المدفوعة: <strong>{paidInstallments}</strong></p>
        <p>❌ المتبقية: <strong>{unpaidInstallments}</strong></p>
        <p>💵 المبلغ المدفوع: <strong>{totalPaidAmount.toLocaleString()} د.ع</strong></p>
        <p>💰 المتبقي: <strong>{totalRemainingAmount.toLocaleString()} د.ع</strong></p>

        <div className="mt-10 text-center text-gray-700">
          <hr className="my-4" />
          <p>🖊️ توقيع المسؤول:</p>
          <div className="h-16 mt-2 border-dashed border border-gray-400 w-1/2 mx-auto" />
          <p className="mt-2">{user?.name || "اسم المشرف"}</p>
          <p className="mt-1">ختم المتجر إن وُجد</p>
        </div>
      </div>

      <table className="w-full text-sm border text-right">
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
            <tr key={index}>
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{new Date(item.date).toLocaleDateString("ar-IQ")}</td>
              <td className="p-2 border">{item.amount}</td>
              <td className="p-2 border">{item.paid ? "✅ مدفوع" : "❌ غير مدفوع"}</td>
              <td className="p-2 border">{item.paidAt ? new Date(item.paidAt).toLocaleDateString("ar-IQ") : "—"}</td>
              <td className="p-2 border space-y-1">
                {!item.paid && (
                  <button onClick={() => handleMarkInstallmentPaid(index)} className="text-green-600 hover:underline block">تم الدفع</button>
                )}
                {item.paid && (
                  <button onClick={() => handleUnmarkInstallmentPaid(index)} className="text-red-600 hover:underline block">إلغاء الدفع</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
