// /pages/admin/analytics.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  uniqueCustomers: number;
  topProducts: { name: string; totalSold: number }[];
  monthlySales: { month: string; total: number }[];
  salesByCategory: { category: string; total: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    axios.get("/api/analytics").then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="p-4">📊 جارٍ تحميل التقارير...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📈 لوحة التقارير</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 text-center">
          <h2 className="text-lg font-bold">📦 عدد الطلبات</h2>
          <p className="text-2xl">{data.totalOrders}</p>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <h2 className="text-lg font-bold">💰 إجمالي المبيعات</h2>
          <p className="text-2xl">{data.totalRevenue.toLocaleString()} د.ع</p>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <h2 className="text-lg font-bold">👤 عدد الزبائن</h2>
          <p className="text-2xl">{data.uniqueCustomers}</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-bold mb-2">🏆 أكثر المنتجات مبيعًا</h2>
        <Bar
          data={{
            labels: data.topProducts.map((p) => p.name),
            datasets: [
              {
                label: "الكمية المباعة",
                data: data.topProducts.map((p) => p.totalSold),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
              },
            ],
          }}
        />
      </div>

      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-bold mb-2">📆 المبيعات الشهرية</h2>
        <Line
          data={{
            labels: data.monthlySales.map((m) => m.month),
            datasets: [
              {
                label: "إجمالي المبيعات",
                data: data.monthlySales.map((m) => m.total),
                fill: false,
                borderColor: "rgba(75, 192, 192, 1)",
              },
            ],
          }}
        />
      </div>

      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-bold mb-2">📂 المبيعات حسب القسم</h2>
        <Pie
          data={{
            labels: data.salesByCategory.map((c) => c.category),
            datasets: [
              {
                label: "القسم",
                data: data.salesByCategory.map((c) => c.total),
                backgroundColor: [
                  "#36A2EB",
                  "#FF6384",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                ],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
