// الكود الكامل لصفحة التحليلات لجميع الزبائن
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    axios.get("/api/analytics/installments").then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="p-4">جاري تحميل البيانات التحليلية...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">📊 لوحة التحليلات العامة</h1>
          <Link
            href="/admin/installments"
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            ← رجوع إلى الأقساط
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* عدد الأقساط المدفوعة شهريًا */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">📅 الأقساط المدفوعة شهريًا</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyPaidInstallments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* أكثر الزبائن التزامًا */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">🏅 أكثر الزبائن التزامًا</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.topCustomers}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => entry.name}
                >
                  {data.topCustomers.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={["#10B981", "#3B82F6", "#F59E0B", "#EF4444"][index % 4]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* الزبائن المتأخرين */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">🚨 الزبائن المتأخرين</h2>
            <ul className="text-sm list-disc pl-5">
              {data.lateCustomers.length > 0 ? (
                data.lateCustomers.map((c: any, i: number) => (
                  <li key={i}>{c.name} - {c.count} قسط متأخر</li>
                ))
              ) : (
                <li>لا يوجد زبائن متأخرين حاليًا</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
