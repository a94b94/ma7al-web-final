// pages/admin/invoices/[id].tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function InvoiceDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (id) {
      axios.get(`/api/invoices/${id}`).then((res) => {
        setInvoice(res.data);
      });
    }
  }, [id]);

  if (!invoice) return <p className="p-4 text-gray-500">⏳ جاري تحميل تفاصيل الفاتورة...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🧾 تفاصيل فاتورة: {invoice.invoiceNumber}</h1>

      <div className="mb-4">
        <p><strong>المورد:</strong> {invoice.supplierName}</p>
        <p><strong>التاريخ:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">المنتج</th>
            <th className="p-2 border">الباركود</th>
            <th className="p-2 border">القسم</th>
            <th className="p-2 border">سعر الشراء</th>
            <th className="p-2 border">الكمية</th>
          </tr>
        </thead>
        <tbody>
          {invoice.products.map((product: any) => (
            <tr key={product._id}>
              <td className="p-2 border">{product.name}</td>
              <td className="p-2 border">{product.barcode}</td>
              <td className="p-2 border">{product.category}</td>
              <td className="p-2 border">{product.purchasePrice.toLocaleString()} د.ع</td>
              <td className="p-2 border">{product.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
