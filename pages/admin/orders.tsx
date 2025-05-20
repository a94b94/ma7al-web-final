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
  const [filterStatus, setFilterStatus] = useState("الكل");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const currentStoreId = localStorage.getItem("selectedStoreId");

    if (!token) {
      toast.error("🚫 يجب تسجيل الدخول أولاً");
      router.push("/login");
      return;
    }

    if (!currentStoreId) {
      toast.error("⚠️ يرجى اختيار محل أولاً");
      router.push("/select-store"); // ❗ غيّرها حسب مسار اختيار المحل عندك
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

  const filteredOrders =
    filterStatus === "الكل"
      ? orders
      : orders.filter(
          (order) => (order.status || "بانتظار التأكيد") === filterStatus
        );

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">📋 الطلبات</h1>

        <div className="mb-4">
          <label className="mr-2 text-sm font-semibold">فلترة حسب الحالة:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="الكل">الكل</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500">جاري التحميل...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-gray-600">لا توجد طلبات بالحالة المحددة.</p>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
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
                {order.storeName && (
                  <p className="text-xs text-gray-500">🏬 {order.storeName}</p>
                )}
                {order.seen === false && (
                  <p className="text-xs text-blue-600 font-semibold">🔔 طلب جديد</p>
                )}

                <div className="flex flex-wrap gap-3 items-center my-2">
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

                <button
                  onClick={() => {
                    const message = `📦 طلب جديد\nالمنتجات:\n${order.cart
                      .map((i) => `- ${i.name} × ${i.quantity}`)
                      .join("\n")}\n📍 ${order.address}\n📞 ${order.phone}`;
                    const phone = order.phone.startsWith("+964")
                      ? order.phone
                      : `+964${order.phone}`;
                    window.open(
                      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                      "_blank"
                    );
                  }}
                  className="mt-3 inline-block text-green-700 border border-green-500 rounded px-3 py-1 text-sm hover:bg-green-100"
                >
                  إرسال عبر واتساب
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
