// pages/admin/sales/index.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface Sale {
  _id: string;
  customer: { name: string; phone: string };
  paymentType: string;
  createdAt: string;
  items: { quantity: number; price: number }[];
}

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    axios.get("/api/sales").then((res) => setSales(res.data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📋 فواتير البيع</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">الزبون</th>
              <th className="border px-4 py-2">رقم الهاتف</th>
              <th className="border px-4 py-2">نوع الدفع</th>
              <th className="border px-4 py-2">التاريخ</th>
              <th className="border px-4 py-2">عدد المنتجات</th>
              <th className="border px-4 py-2">الإجمالي</th>
              <th className="border px-4 py-2">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale._id}>
                <td className="border px-4 py-2">{sale.customer.name}</td>
                <td className="border px-4 py-2">{sale.customer.phone}</td>
                <td className="border px-4 py-2">{sale.paymentType === "cash" ? "نقدي" : "تقسيط"}</td>
                <td className="border px-4 py-2">{new Date(sale.createdAt).toLocaleDateString()}</td>
                <td className="border px-4 py-2">{sale.items.length}</td>
                <td className="border px-4 py-2">
                  {sale.items.reduce((sum, i) => sum + i.quantity * i.price, 0)} د.ع
                </td>
                <td className="border px-4 py-2">
                  <Link
                    href={`/admin/sales/${sale._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    تفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
