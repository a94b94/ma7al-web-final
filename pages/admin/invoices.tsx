// pages/admin/invoices.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface PurchaseInvoice {
  _id: string;
  invoiceNumber: string;
  supplierName: string;
  date: string;
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total?: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/invoices").then((res) => {
      // ترتيب حسب الأحدث
      const sorted = res.data.sort((a: PurchaseInvoice, b: PurchaseInvoice) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setInvoices(sorted);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📄 فواتير الشراء</h1>

      {loading ? (
        <p className="text-center text-gray-500">جاري التحميل...</p>
      ) : invoices.length === 0 ? (
        <p className="text-gray-500">لا توجد فواتير حالياً.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-center bg-white shadow-sm rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">رقم الفاتورة</th>
                <th className="p-2 border">المورد</th>
                <th className="p-2 border">التاريخ</th>
                <th className="p-2 border">عدد المنتجات</th>
                <th className="p-2 border">الإجمالي</th>
                <th className="p-2 border">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50 transition">
                  <td className="p-2 border">{invoice.invoiceNumber}</td>
                  <td className="p-2 border">{invoice.supplierName}</td>
                  <td className="p-2 border">
                    {new Date(invoice.date).toLocaleDateString("ar-IQ")}
                  </td>
                  <td className="p-2 border">{invoice.products.length}</td>
                  <td className="p-2 border font-semibold text-green-700">
                    {invoice.total?.toLocaleString("ar-IQ") || "-"} د.ع
                  </td>
                  <td className="p-2 border">
                    <Link
                      href={`/admin/invoices/${invoice._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      عرض
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
