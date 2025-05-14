// pages/admin/invoices.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    axios.get("/api/invoices").then((res) => {
      setInvoices(res.data);
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📄 فواتير الشراء</h1>

      {invoices.length === 0 ? (
        <p className="text-gray-500">لا توجد فواتير حالياً.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">رقم الفاتورة</th>
                <th className="p-2 border">المورد</th>
                <th className="p-2 border">التاريخ</th>
                <th className="p-2 border">عدد المنتجات</th>
                <th className="p-2 border">تفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice: any) => (
                <tr key={invoice._id}>
                  <td className="p-2 border">{invoice.invoiceNumber}</td>
                  <td className="p-2 border">{invoice.supplierName}</td>
                  <td className="p-2 border">{new Date(invoice.date).toLocaleDateString()}</td>
                  <td className="p-2 border">{invoice.products.length}</td>
                  <td className="p-2 border text-center">
                    <Link href={`/admin/invoices/${invoice._id}`} className="text-blue-600 hover:underline">
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
