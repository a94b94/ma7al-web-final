"use client";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <AdminLayout><p className="p-4">🔄 جارٍ تحميل الزبائن...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">👥 قائمة الزبائن</h1>

        {customers.length === 0 ? (
          <p className="text-gray-500">❌ لا توجد بيانات زبائن حالياً.</p>
        ) : (
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">الاسم</th>
                <th className="border p-2">الهاتف</th>
                <th className="border p-2">عرض</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone}>
                  <td className="border p-2">{c.name}</td>
                  <td className="border p-2">{c.phone}</td>
                  <td className="border p-2">
                    <a href={`/admin/customers/${c.phone}`} className="text-blue-600 underline">
                      عرض التقرير
                    </a>
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
