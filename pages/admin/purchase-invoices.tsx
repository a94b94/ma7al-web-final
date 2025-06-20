// pages/admin/purchase-invoices.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface PurchaseInvoice {
  _id: string;
  invoiceNumber: string;
  supplierName: string;
  date: string;
  products: { name: string; quantity: number; purchasePrice: number }[];
}

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/purchase-invoices/list") // تأكد أن لديك هذا الـ API
      .then((res) => setInvoices(res.data))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📦 فواتير الشراء</h1>

      {loading ? (
        <p className="text-gray-500">⏳ جاري تحميل الفواتير...</p>
      ) : invoices.length === 0 ? (
        <p className="text-red-500">❌ لا توجد فواتير شراء حتى الآن</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">رقم الفاتورة</th>
                <th className="p-2 border">المورد</th>
                <th className="p-2 border">التاريخ</th>
                <th className="p-2 border">عدد المنتجات</th>
                <th className="p-2 border">الإجمالي</th>
                <th className="p-2 border">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => {
                const total = inv.products.reduce(
                  (sum, p) => sum + p.purchasePrice * p.quantity,
                  0
                );

                return (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="p-2 border text-center">{idx + 1}</td>
                    <td className="p-2 border">{inv.invoiceNumber}</td>
                    <td className="p-2 border">{inv.supplierName}</td>
                    <td className="p-2 border">{new Date(inv.date).toLocaleDateString("ar-IQ")}</td>
                    <td className="p-2 border text-center">{inv.products.length}</td>
                    <td className="p-2 border text-center">{total.toLocaleString("ar-IQ")} د.ع</td>
                    <td className="p-2 border text-center">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => router.push(`/admin/invoices/${inv._id}`)}
                      >
                        📄 عرض
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
