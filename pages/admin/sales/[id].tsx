// pages/admin/sales/[id].tsx
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

interface Sale {
  _id: string;
  customer: { name: string; phone: string };
  paymentType: string;
  createdAt: string;
  downPayment: number;
  installmentsCount: number;
  dueDate?: string;
  items: {
    productId: { name: string };
    quantity: number;
    price: number;
  }[];
}

export default function SaleDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [sale, setSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (id) {
      axios.get(`/api/sales/${id}`).then((res) => setSale(res.data));
    }
  }, [id]);

  if (!sale) return <div className="p-4">جاري تحميل البيانات...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">🧾 تفاصيل الفاتورة</h1>

      <div className="mb-4 space-y-1">
        <p>📌 الزبون: <strong>{sale.customer.name}</strong></p>
        <p>📞 الهاتف: {sale.customer.phone}</p>
        <p>💳 نوع الدفع: {sale.paymentType === "cash" ? "نقدي" : "تقسيط"}</p>
        <p>📅 التاريخ: {new Date(sale.createdAt).toLocaleDateString()}</p>
        {sale.paymentType === "installment" && (
          <>
            <p>💰 الدفعة الأولى: {sale.downPayment} د.ع</p>
            <p>📆 عدد الأقساط: {sale.installmentsCount}</p>
            <p>📍 أول استحقاق: {new Date(sale.dueDate!).toLocaleDateString()}</p>
          </>
        )}
      </div>

      <table className="w-full border text-sm mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">المنتج</th>
            <th className="border px-2 py-1">الكمية</th>
            <th className="border px-2 py-1">السعر</th>
            <th className="border px-2 py-1">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, i) => (
            <tr key={i}>
              <td className="border px-2 py-1">{item.productId.name}</td>
              <td className="border px-2 py-1">{item.quantity}</td>
              <td className="border px-2 py-1">{item.price} د.ع</td>
              <td className="border px-2 py-1">{item.quantity * item.price} د.ع</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-right font-bold">المجموع: {sale.items.reduce((sum, i) => sum + i.quantity * i.price, 0)} د.ع</p>

      <div className="mt-4 flex gap-4">
        <button onClick={() => window.print()} className="bg-gray-700 text-white px-6 py-2 rounded">
          🖨️ طباعة الفاتورة
        </button>
      </div>
    </div>
  );
}
