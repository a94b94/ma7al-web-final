"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  ArrowLeftCircle,
  DollarSign,
  BarChart2,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminHomePage() {
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [topProduct, setTopProduct] = useState({ name: "-", quantity: 0 });
  const [dailyRevenue, setDailyRevenue] = useState<{ date: string; total: number }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setProductsCount(data.productsCount);
          setOrdersCount(data.ordersCount);
          setTodayRevenue(data.todayRevenue);
          setTopProduct(data.topProduct);
          setDailyRevenue(data.dailyRevenue);
        } else {
          console.warn("فشل في تحميل البيانات:", data.message);
        }
      } catch (error) {
        console.error("حدث خطأ أثناء جلب الإحصائيات:", error);
      }
    };
    fetchStats();
  }, []);

  const chartData = {
    labels: dailyRevenue.map((entry) =>
      new Date(entry.date).toLocaleDateString("ar-IQ", { weekday: "short", day: "numeric", month: "short" })
    ),
    datasets: [
      {
        label: "الأرباح اليومية (د.ع)",
        data: dailyRevenue.map((entry) => entry.total),
        fill: false,
        borderColor: "#2563eb",
        backgroundColor: "#3b82f6",
        tension: 0.4,
      },
    ],
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-700 flex items-center gap-2 animate-pulse">
            🎛️ لوحة تحكم المتجر
          </h1>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push("/")}
          >
            <ArrowLeftCircle size={18} /> رجوع إلى الرئيسية
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Package className="text-blue-600" />} label="المنتجات" value={productsCount} link="/admin/products" />
          <StatCard icon={<ShoppingCart className="text-green-600" />} label="الطلبات" value={ordersCount} link="/admin/orders" />
          <StatCard icon={<DollarSign className="text-yellow-500" />} label="أرباح اليوم" value={`${todayRevenue.toLocaleString("ar-IQ")} د.ع`} />
          <StatCard icon={<BarChart2 className="text-purple-600" />} label="الأكثر مبيعاً" value={`${topProduct.name} (${topProduct.quantity})`} />
        </div>

        <Card className="shadow-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <BarChart2 /> تحليل الأرباح خلال 7 أيام
            </h2>
            <div className="h-96">
              <Line data={chartData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
  link?: string;
}) {
  const router = useRouter();
  return (
    <Card
      className={`shadow-md hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer border border-gray-100 bg-white/90 backdrop-blur-md`}
      onClick={() => link && router.push(link)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
            {icon} {label}
          </h2>
          <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
        {link && (
          <Button variant="outline" className="mt-4 w-full">
            عرض التفاصيل
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
