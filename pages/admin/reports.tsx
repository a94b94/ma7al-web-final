import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

const ReportsPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const months = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/reports/invoices?year=${year}`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch {
        console.error("فشل في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    const fetchTopProducts = async () => {
      try {
        const res = await axios.get(`/api/reports/top-products?year=${year}`);
        if (res.data.success) {
          setTopProducts(res.data.data);
        }
      } catch {
        console.error("فشل في جلب المنتجات");
      }
    };

    fetchReports();
    fetchTopProducts();
  }, [year]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">📊 تقارير السنة {year}</h1>

      <div className="mb-4 text-center">
        <label className="font-semibold">اختر السنة: </label>
        <select
          className="border p-2 rounded ml-2"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center">جاري التحميل...</p>
      ) : (
        <>
          {/* الرسم البياني */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.map((d, i) => ({ ...d, monthName: months[i] }))}>
              <XAxis dataKey="monthName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cash" fill="#4ade80" name="مبيعات نقد" />
              <Bar dataKey="installment" fill="#60a5fa" name="مبيعات أقساط" />
            </BarChart>
          </ResponsiveContainer>

          {/* جدول الفواتير */}
          <table className="w-full border mt-6 text-right text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">الشهر</th>
                <th className="border p-2">عدد الفواتير</th>
                <th className="border p-2">مبيعات نقد</th>
                <th className="border p-2">مبيعات أقساط</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{months[idx]}</td>
                  <td className="border p-2">{row.count}</td>
                  <td className="border p-2">{row.cash.toLocaleString("ar-EG")} د.ع</td>
                  <td className="border p-2">{row.installment.toLocaleString("ar-EG")} د.ع</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* أكثر المنتجات مبيعًا */}
          <h2 className="text-xl font-semibold mt-10 mb-2">📦 أكثر المنتجات مبيعًا</h2>
          <table className="w-full border text-right text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">المنتج</th>
                <th className="border p-2">الكمية</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((item, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
