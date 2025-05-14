import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

type Order = {
  _id: string;
  phone: string;
  address: string;
  cart: { name: string; quantity: number; price: number }[];
  total: number;
  createdAt: string;
  seen?: boolean;
  status?: string;
  storeId?: string;
  storeName?: string;
};

const STATUS_OPTIONS = [
  "بانتظار التأكيد",
  "قيد المعالجة",
  "تم الشحن",
  "تم التوصيل",
  "مكتمل",
  "ملغي",
];

const getStatusClasses = (status: string) => {
  switch (status) {
    case "بانتظار التأكيد":
      return "bg-yellow-100 text-yellow-800";
    case "قيد المعالجة":
      return "bg-blue-100 text-blue-800";
    case "تم الشحن":
      return "bg-indigo-100 text-indigo-800";
    case "تم التوصيل":
      return "bg-cyan-100 text-cyan-800";
    case "مكتمل":
      return "bg-green-100 text-green-800";
    case "ملغي":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentStoreId = localStorage.getItem("selectedStoreId");

    if (!token || !currentStoreId) {
      toast.error("🚫 يجب تسجيل الدخول واختيار محل");
      router.push("/login");
      return;
    }

    fetch("/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const allOrders = data.orders || [];
        const filtered = allOrders.filter(
          (order: Order) => order.storeId === currentStoreId
        );
        setOrders(filtered);
        if (data.newOrdersCount && filtered.length > 0) {
          toast.success(`🔔 ${filtered.length} طلب جديد لمتجرك`);
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error("❌ فشل في جلب الطلبات");
        setLoading(false);
      });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/update-status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });

    if (res.ok) {
      toast.success("✅ تم تحديث حالة الطلب");
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } else {
      toast.error("❌ فشل التحديث");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">📋 الطلبات</h1>

        {loading ? (
          <p className="text-gray-500">جاري التحميل...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">لا توجد طلبات مرتبطة بمتجرك.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className={`border rounded-xl p-4 shadow transition hover:shadow-lg ${
                  order.seen === false ? "bg-blue-50 border-blue-400" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    📅 {new Date(order.createdAt).toLocaleString("ar-EG")}
                  </span>
                  <span className="text-green-600 font-bold">
                    💰 {order.total.toLocaleString()} د.ع
                  </span>
                </div>

                <p className="text-sm mb-1">📱 {order.phone}</p>
                <p className="text-sm mb-1">📍 {order.address}</p>

                <div className="flex flex-wrap gap-3 items-center mb-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusClasses(
                      order.status || "بانتظار التأكيد"
                    )}`}
                  >
                    {order.status || "بانتظار التأكيد"}
                  </span>

                  <select
                    value={order.status || "بانتظار التأكيد"}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  {order.cart.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.quantity} -{" "}
                      {item.price.toLocaleString()} د.ع
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
