// ✅ صفحة: /admin/index.tsx
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
  AlertTriangle,
  RefreshCcw,
  FileWarning,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import toast from "react-hot-toast";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AdminHomePage() {
  const [productsCount, setProductsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [topProduct, setTopProduct] = useState({ name: "-", quantity: 0 });
  const [dailyRevenue, setDailyRevenue] = useState<{ date: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingPurchases, setPendingPurchases] = useState(0);
  const [pendingSales, setPendingSales] = useState(0);
  const router = useRouter();

  const refreshPendingCounts = async () => {
    const db = await import("@/lib/db/offlineStore");
    const purchaseItems = await db.getAllPendingPurchaseInvoices();
    const salesItems = await db.getAllPendingInvoices();
    setPendingPurchases(purchaseItems.length);
    setPendingSales(salesItems.length);
  };

  const syncPendingPurchases = async () => {
    const db = await import("@/lib/db/offlineStore");
    const invoices = await db.getAllPendingPurchaseInvoices();
    if (invoices.length === 0) return toast("لا توجد فواتير شراء للمزامنة");

    try {
      for (const invoice of invoices) {
        await fetch("/api/purchase-invoice/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoice),
        });
      }
      await db.clearPendingPurchaseInvoices();
      toast.success("✅ تم مزامنة فواتير الشراء!");
      refreshPendingCounts();
    } catch (error) {
      toast.error("❌ فشل مزامنة فواتير الشراء");
    }
  };

  const syncPendingSales = async () => {
    const db = await import("@/lib/db/offlineStore");
    const invoices = await db.getAllPendingInvoices();
    if (invoices.length === 0) return toast("لا توجد فواتير بيع للمزامنة");

    try {
      for (const invoice of invoices) {
        await fetch("/api/sales/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invoice),
        });
      }
      await db.clearPendingInvoices();
      toast.success("✅ تم مزامنة فواتير البيع!");
      refreshPendingCounts();
    } catch (error) {
      toast.error("❌ فشل مزامنة فواتير البيع");
    }
  };

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
          setProductsCount(data.productsCount || 0);
          setOrdersCount(data.ordersCount || 0);
          setTodayRevenue(data.todayRevenue || 0);
          setTopProduct(data.topProduct || { name: "-", quantity: 0 });
          setDailyRevenue(data.dailyRevenue || []);
        } else {
          toast.error("فشل في تحميل الإحصائيات");
        }
      } catch (error) {
        toast.error("حدث خطأ أثناء جلب البيانات");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    refreshPendingCounts();
  }, []);

  const chartData = {
    labels: dailyRevenue.map((entry) =>
      new Date(entry.date).toLocaleDateString("ar-IQ", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold text-indigo-700 flex items-center gap-2 animate-pulse">
            🎛️ لوحة تحكم المتجر
          </h1>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => router.push("/")}
            >
              <ArrowLeftCircle size={18} /> رجوع إلى الرئيسية
            </Button>
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => router.push("/admin/offline-invoices")}
            >
              <FileWarning size={16} /> الفواتير غير المتزامنة
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center">جارٍ تحميل الإحصائيات...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon={<Package className="text-blue-600" />} label="المنتجات" value={productsCount} link="/admin/products" />
              <StatCard icon={<ShoppingCart className="text-green-600" />} label="الطلبات" value={ordersCount} link="/admin/orders" />
              <StatCard icon={<DollarSign className="text-yellow-500" />} label="أرباح اليوم" value={`${todayRevenue.toLocaleString("ar-IQ")} د.ع`} />
              <StatCard icon={<BarChart2 className="text-purple-600" />} label="الأكثر مبيعاً" value={`${topProduct.name} (${topProduct.quantity})`} />

              <StatCard
                icon={<AlertTriangle className="text-red-600" />} label="مشتريات غير متزامنة"
                value={pendingPurchases}
                link="/admin/purchase-invoices"
              >
                <Button variant="outline" className="w-full mt-4" onClick={syncPendingPurchases}>
                  <RefreshCcw className="w-4 h-4 mr-2" /> مزامنة الآن
                </Button>
              </StatCard>

              <StatCard
                icon={<AlertTriangle className="text-orange-500" />} label="مبيعات غير متزامنة"
                value={pendingSales}
                link="/admin/orders"
              >
                <Button variant="outline" className="w-full mt-4" onClick={syncPendingSales}>
                  <RefreshCcw className="w-4 h-4 mr-2" /> مزامنة الآن
                </Button>
              </StatCard>
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
          </>
        )}
      </motion.div>
    </AdminLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  link,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
  link?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
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
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
