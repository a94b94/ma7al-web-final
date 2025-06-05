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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setSelectedDetail(null);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append("from", fromDate);
      if (toDate) params.append("to", toDate);

      const res = await axios.get(`/api/analytics?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error("خطأ في تحميل البيانات:", err);
      alert("❌ فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
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

  if (!data)
    return <p className="p-4 text-center">📊 جارٍ تحميل البيانات...</p>;

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
          disabled={loading}
          className="self-end bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "⏳ جاري التصفية..." : "🔍 فلترة"}
        </button>
        <button
          onClick={exportToPDF}
          className="self-end bg-green-700 text-white px-4 py-2 rounded"
        >
          📄 تصدير PDF
        </button>
      </div>

      {selectedDetail && (
        <div className="mb-4 p-4 bg-yellow-100 rounded border text-sm font-medium">
          <strong>📌 تفاصيل:</strong> {selectedDetail}
        </div>
      )}

      <div id="report-content">
        {/* مؤشرات عامة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="📦 عدد الطلبات" value={data.totalOrders} />
          <StatCard
            title="💰 إجمالي المبيعات"
            value={`${data.totalRevenue.toLocaleString()} د.ع`}
          />
          <StatCard title="👤 عدد الزبائن" value={data.uniqueCustomers} />
        </div>

        {/* المنتجات الأكثر مبيعًا */}
        <ChartSection
          title="🏆 أكثر المنتجات مبيعًا"
          chart={
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
                    const i = elements[0].index;
                    const p = data.topProducts[i];
                    setSelectedDetail(`المنتج: ${p.name} - مبيعات: ${p.totalSold}`);
                  }
                },
              }}
            />
          }
        />

        {/* المبيعات الشهرية */}
        <ChartSection
          title="📆 المبيعات الشهرية"
          chart={
            <Line
              data={{
                labels: data.monthlySales.map((m) => m.month),
                datasets: [
                  {
                    label: "إجمالي المبيعات",
                    data: data.monthlySales.map((m) => m.total),
                    fill: false,
                    borderColor: "rgba(75, 192, 192, 1)",
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                onClick: (_, elements) => {
                  if (elements.length > 0) {
                    const i = elements[0].index;
                    const m = data.monthlySales[i];
                    setSelectedDetail(`📅 شهر ${m.month} - المبيعات: ${m.total.toLocaleString()} د.ع`);
                  }
                },
              }}
            />
          }
        />

        {/* المبيعات حسب القسم */}
        <ChartSection
          title="📂 المبيعات حسب القسم"
          chart={
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
                    const i = elements[0].index;
                    const c = data.salesByCategory[i];
                    setSelectedDetail(`القسم: ${c.category} - المبيعات: ${c.total.toLocaleString()} د.ع`);
                  }
                },
              }}
            />
          }
        />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-white rounded shadow p-4 text-center">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ChartSection({ title, chart }: { title: string; chart: React.ReactNode }) {
  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      {chart}
    </div>
  );
}
