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
  ArcElement,
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
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);

  const fetchData = async () => {
    const params = new URLSearchParams();
    if (fromDate) params.append("from", fromDate);
    if (toDate) params.append("to", toDate);

    const res = await axios.get(`/api/analytics?${params.toString()}`);
    setData(res.data);
  };

  const exportToPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("report-content");
    if (element) {
      html2pdf()
        .set({
          filename: `analytics-report.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return <p className="p-4">📊 جارٍ تحميل التقارير...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">📈 لوحة التقارير</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">من تاريخ</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-3 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">إلى تاريخ</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-3 py-1"
          />
        </div>
        <button
          onClick={fetchData}
          className="self-end bg-blue-600 text-white px-4 py-2 rounded"
        >
          🔍 فلترة
        </button>
        <button
          onClick={exportToPDF}
          className="self-end bg-green-700 text-white px-4 py-2 rounded"
        >
          📄 تصدير PDF
        </button>
      </div>

      {selectedDetail && (
        <div className="mb-4 p-4 bg-yellow-100 rounded border">
          <strong>📌 تفاصيل:</strong> {selectedDetail}
        </div>
      )}

      <div id="report-content">
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
            options={{
              onClick: (_, elements) => {
                if (elements.length > 0) {
                  const index = elements[0].index;
                  const product = data.topProducts[index];
                  setSelectedDetail(`المنتج: ${product.name} - مبيعات: ${product.totalSold}`);
                }
              },
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
            options={{
              onClick: (_, elements) => {
                if (elements.length > 0) {
                  const index = elements[0].index;
                  const month = data.monthlySales[index];
                  setSelectedDetail(`📅 شهر ${month.month} - المبيعات: ${month.total.toLocaleString()} د.ع`);
                }
              },
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
            options={{
              onClick: (_, elements) => {
                if (elements.length > 0) {
                  const index = elements[0].index;
                  const category = data.salesByCategory[index];
                  setSelectedDetail(`القسم: ${category.category} - مبيعات: ${category.total.toLocaleString()} د.ع`);
                }
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
