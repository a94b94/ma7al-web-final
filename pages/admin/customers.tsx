"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface Customer {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/customers/list")
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setCustomers([]);
      });
  }, []);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">👥 قائمة الزبائن</h1>

        <input
          type="text"
          placeholder="🔍 بحث بالاسم أو الهاتف..."
          className="mb-4 p-2 border rounded w-full max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className="text-gray-600">⏳ جاري تحميل الزبائن...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">❌ لا توجد نتائج مطابقة.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-right">
              <tr>
                <th className="border p-2">الاسم</th>
                <th className="border p-2">الهاتف</th>
                <th className="border p-2">عدد الطلبات</th>
                <th className="border p-2">المجموع</th>
                <th className="border p-2">📄 تقرير</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.phone}>
                  <td className="border p-2">{c.name}</td>
                  <td className="border p-2">{c.phone}</td>
                  <td className="border p-2 text-center">{c.orderCount}</td>
                  <td className="border p-2 text-center">{c.totalSpent.toLocaleString()} د.ع</td>
                  <td className="border p-2 text-center">
                    <Link
                      href={`/admin/customers/${c.phone}`}
                      className="text-blue-600 underline"
                    >
                      عرض التقرير
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
