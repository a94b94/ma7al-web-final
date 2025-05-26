// /pages/admin/customers.tsx
"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CustomerSummary {
  phone: string;
  name: string;
  address: string;
  totalOrders: number;
  totalPaid: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/customers").then((res) => {
      setCustomers(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-700">👥 الزبائن</h1>
          <Link href="/admin/customers/add">
            <Button className="bg-green-600 text-white hover:bg-green-700">
              ➕ زبون جديد
            </Button>
          </Link>
        </div>

        {loading ? (
          <p>🔄 جارٍ تحميل الزبائن...</p>
        ) : customers.length === 0 ? (
          <p className="text-gray-500">لا توجد بيانات زبائن حالياً.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right border">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 border">📞 الهاتف</th>
                  <th className="p-2 border">👤 الاسم</th>
                  <th className="p-2 border">📍 العنوان</th>
                  <th className="p-2 border">📦 عدد الطلبات</th>
                  <th className="p-2 border">💰 الإجمالي المدفوع</th>
                  <th className="p-2 border">📄 التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.phone} className="border-b">
                    <td className="p-2 border">{c.phone}</td>
                    <td className="p-2 border">{c.name}</td>
                    <td className="p-2 border">{c.address}</td>
                    <td className="p-2 border text-center">{c.totalOrders}</td>
                    <td className="p-2 border">{c.totalPaid.toLocaleString()} د.ع</td>
                    <td className="p-2 border text-center">
                      <Link href={`/admin/customers/${c.phone}`}>
                        <Button size="sm">عرض</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
