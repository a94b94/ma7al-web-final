ء// pages/admin/local-invoices.tsx

import React, { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const InvoicePreview = dynamic(() => import("@/components/InvoicePreview"), {
  ssr: false,
});

interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

interface LocalInvoiceType {
  _id: string;
  phone: string;
  address: string;
  total: number;
  type: "cash" | "installment";
  createdAt: string;
  cart: CartItem[];
  downPayment?: number;
  installmentsCount?: number;
  dueDate?: string;
  remaining?: number;
  paid?: number;
  discount?: number;
}

export default function LocalInvoicesPage({ invoices }: { invoices: LocalInvoiceType[] }) {
  const [selectedInvoice, setSelectedInvoice] = useState<LocalInvoiceType | null>(null);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const { type = "all", from = "", to = "" } = router.query;

  const updateFilters = (newType: string, newFrom: string, newTo: string) => {
    const query: any = {};
    if (newType !== "all") query.type = newType;
    if (newFrom) query.from = newFrom;
    if (newTo) query.to = newTo;
    router.push({ pathname: "/admin/local-invoices", query });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذه الفاتورة؟")) return;
    try {
      const res = await fetch(`/api/local-sale/delete?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ تم حذف الفاتورة");
        window.location.reload();
      } else {
        toast.error("❌ فشل في الحذف");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleView = async (id: string) => {
    try {
      const res = await fetch(`/api/local-sale/get?id=${id}`);
      const { success, invoice } = await res.json();
      if (success) {
        const fixedInvoice: LocalInvoiceType = {
          ...invoice,
          type: invoice.type === "installment" ? "installment" : "cash",
        };
        setSelectedInvoice(fixedInvoice);
        setShowModal(true);
      } else {
        toast.error("❌ لم يتم العثور على الفاتورة");
      }
    } catch {
      toast.error("❌ فشل في تحميل الفاتورة");
    }
  };

  const exportToExcel = () => {
    const exportData = invoices.map((inv) => ({
      الاسم: inv.address,
      الهاتف: inv.phone,
      المبلغ: inv.total,
      النوع: inv.type === "installment" ? "أقساط" : "نقد",
      التاريخ: new Date(inv.createdAt).toLocaleDateString("ar-EG"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "فواتير");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(dataBlob, "الفواتير_المحلية.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📋 قائمة الفواتير المحلية</h1>

      <div className="flex flex-wrap gap-4 mb-6 justify-between items-center">
        <select
          className="border p-2 rounded"
          value={type}
          onChange={(e) => updateFilters(e.target.value, from as string, to as string)}
        >
          <option value="all">📁 كل الأنواع</option>
          <option value="cash">💵 نقد</option>
          <option value="installment">📄 أقساط</option>
        </select>

        <div className="flex gap-2 items-center">
          <label>من:</label>
          <input
            type="date"
            className="border p-1 rounded"
            value={from}
            onChange={(e) => updateFilters(type as string, e.target.value, to as string)}
          />
          <label>إلى:</label>
          <input
            type="date"
            className="border p-1 rounded"
            value={to}
            onChange={(e) => updateFilters(type as string, from as string, e.target.value)}
          />
        </div>

        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📤 تصدير إلى Excel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">الاسم</th>
              <th className="p-2 border">الهاتف</th>
              <th className="p-2 border">المبلغ</th>
              <th className="p-2 border">النوع</th>
              <th className="p-2 border">التاريخ</th>
              <th className="p-2 border">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50">
                <td className="p-2 border">{inv.address}</td>
                <td className="p-2 border">{inv.phone}</td>
                <td className="p-2 border">{inv.total.toLocaleString("ar-EG")} د.ع</td>
                <td className="p-2 border">{inv.type === "installment" ? "أقساط" : "نقد"}</td>
                <td className="p-2 border">{new Date(inv.createdAt).toLocaleDateString("ar-EG")}</td>
                <td className="p-2 border text-center flex flex-wrap gap-2 justify-center">
                  <button onClick={() => handleView(inv._id)} className="text-blue-600 hover:text-blue-800 font-bold">
                    📄 عرض
                  </button>
                  <a
                    href={`/admin/local-sale?id=${inv._id}&print=true`}
                    target="_blank"
                    className="text-green-600 hover:text-green-800 font-bold"
                  >
                    🖨️ طباعة
                  </a>
                  <button onClick={() => handleDelete(inv._id)} className="text-red-600 hover:text-red-800 font-bold">
                    🗑️ حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-4 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setShowModal(false)} className="absolute top-2 left-2 text-red-500 text-xl font-bold">✖</button>
            <InvoicePreview
              order={selectedInvoice}
              storeName="Ma7al Store"
              showActions={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  await dbConnect();

  const { type, from, to } = query;
  const filter: any = {};

  if (type && type !== "all") filter.type = type;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from as string);
    if (to) {
      const toDate = new Date(to as string);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  const rawInvoices = await LocalInvoice.find(filter).sort({ createdAt: -1 }).lean();

  const invoices: LocalInvoiceType[] = rawInvoices.map((inv: any) => ({
    _id: inv._id.toString(),
    phone: inv.phone,
    address: inv.address,
    total: inv.total,
    type: inv.type === "installment" ? "installment" : "cash",
    createdAt: inv.createdAt.toString(),
    cart: inv.cart || [],
    downPayment: inv.downPayment || 0,
    installmentsCount: inv.installmentsCount || 0,
    dueDate: inv.dueDate || "",
    remaining: inv.remaining || 0,
    paid: inv.paid || 0,
    discount: inv.discount || 0,
  }));

  return { props: { invoices } };
};
