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
} from "recharts";
import Link from "next/link";

interface MonthlyInstallment {
  month: string;
  count: number;
}

interface CustomerData {
  name: string;
  count: number;
}

interface AnalyticsData {
  monthlyPaidInstallments: MonthlyInstallment[];
  topCustomers: CustomerData[];
  lateCustomers: CustomerData[];
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    monthlyPaidInstallments: [],
    topCustomers: [],
    lateCustomers: [],
  });

  useEffect(() => {
    axios.get("/api/analytics/installments").then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p className="p-4 text-gray-600">⏳ جاري تحميل البيانات التحليلية...</p>
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
          {/* الأقساط المدفوعة شهريًا */}
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
            <div className="mt-2 text-sm text-gray-600">
              📈 مجموع الأقساط:{" "}
              <strong>
                {data.monthlyPaidInstallments.reduce((acc, item) => acc + item.count, 0)}
              </strong>
            </div>
          </div>

          {/* أكثر الزبائن التزامًا */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-2">🏅 أكثر الزبائن التزامًا</h2>
            {data.topCustomers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.topCustomers}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name} (${entry.count})`}
                  >
                    {data.topCustomers.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#10B981", "#3B82F6", "#F59E0B", "#EF4444"][index % 4]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">لا يوجد بيانات حالياً</p>
            )}
          </div>

          {/* الزبائن المتأخرين */}
          <div className="bg-white p-4 rounded shadow md:col-span-2">
            <h2 className="text-lg font-bold mb-2">🚨 الزبائن المتأخرين</h2>
            {data.lateCustomers.length > 0 ? (
              <ul className="text-sm list-disc pl-6 space-y-1">
                {data.lateCustomers.map((c, i) => (
                  <li key={i} className="text-red-700">
                    {c.name} — {c.count} قسط متأخر
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">✅ لا يوجد زبائن متأخرين حاليًا</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
