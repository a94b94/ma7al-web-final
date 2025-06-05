"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface Order {
  _id: string;
  total: number;
  paid: number;
  dueDate?: string;
  createdAt: string;
  status: string;
}

interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  orders: Order[];
  orderCount: number;
  totalSpent: number;
}

export default function CustomerDetailsPage() {
  const router = useRouter();
  const { phone } = router.query;
  const [data, setData] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (router.isReady && phone) {
      axios
        .get(`/api/customers/${phone}`)
        .then((res) => {
          const result: CustomerDetails = res.data;
          setData(result);
          setFilteredOrders(result.orders || []);
        })
        .catch((err) => {
          console.error("❌ فشل تحميل بيانات الزبون:", err);
          setData(null);
        })
        .finally(() => setLoading(false));
    }
  }, [router.isReady, phone]);

  const exportToPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("customer-report");
    if (element) {
      html2pdf()
        .set({
          filename: `customer-${phone}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { format: "a4" },
        })
        .from(element)
        .save();
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (!data) return;
    const results = data.orders.filter((order) =>
      new Date(order.createdAt).toLocaleDateString("ar-EG").includes(value)
    );
    setFilteredOrders(results);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">⏳ تحميل...</div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-600">⚠️ لا توجد بيانات لعرضها</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-blue-700">📄 تقرير الزبون: {data.name}</h1>
          <Button className="bg-green-600 text-white" onClick={exportToPDF}>
            📤 تصدير PDF
          </Button>
        </div>

        <div id="customer-report" className="bg-white p-4 rounded shadow mb-6">
          <div className="space-y-1 text-sm">
            <p><strong>👤 الاسم:</strong> {data.name}</p>
            <p><strong>📞 الهاتف:</strong> {data.phone}</p>
            <p><strong>📍 العنوان:</strong> {data.address}</p>
            <p><strong>📦 عدد الطلبات:</strong> {data.orderCount}</p>
            <p><strong>💰 مجموع الإنفاق:</strong> {data.totalSpent.toLocaleString()} د.ع</p>
          </div>

          <div className="my-4">
            <label className="block text-sm font-medium mb-1">🔍 بحث بالتاريخ:</label>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="مثال: 2024/05/01"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold">📦 الطلبات:</h2>
          <table className="w-full mt-2 text-sm text-right border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">📅 التاريخ</th>
                <th className="p-2 border">💵 الإجمالي</th>
                <th className="p-2 border">✅ المدفوع</th>
                <th className="p-2 border">📌 الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-4 text-gray-500">لا توجد نتائج مطابقة</td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order._id} className="border-b">
                    <td className="p-2 border">{index + 1}</td>
                    <td className="p-2 border">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-2 border">{order.total.toLocaleString()} د.ع</td>
                    <td className="p-2 border">{order.paid.toLocaleString()} د.ع</td>
                    <td className="p-2 border">{order.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
