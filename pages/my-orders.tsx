import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

const getStatusClass = (status: string) => {
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

export default function MyOrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    fetch("/api/my-orders", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => console.error("فشل في جلب الطلبات"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        🚫 يجب تسجيل الدخول لعرض الطلبات
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">📦 طلباتي</h1>

      {loading ? (
        <p className="text-gray-500">⏳ جاري التحميل...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">لا توجد طلبات حتى الآن.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div
              key={order._id}
              className="bg-white p-5 rounded-xl shadow border border-gray-200"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700 text-sm">
                  🆔 رقم الطلب: {order._id.slice(-6)}
                </p>
                <p className="text-sm text-gray-500">
                  📅 {new Date(order.createdAt).toLocaleString("ar-EG")}
                </p>
              </div>

              <div className="mb-2">
                <span
                  className={`text-xs px-2 py-1 rounded font-semibold ${getStatusClass(
                    order.status || "قيد المعالجة"
                  )}`}
                >
                  🟢 الحالة: {order.status || "قيد المعالجة"}
                </span>
              </div>

              <p className="text-sm text-gray-700 mb-1">📍 العنوان: {order.address}</p>
              <p className="text-sm text-gray-700 mb-2">📞 الهاتف: {order.phone}</p>

              <ul className="list-disc pl-6 text-sm text-gray-600">
                {order.cart.map((item: any, idx: number) => (
                  <li key={idx}>
                    {item.name} × {item.quantity} —{" "}
                    {(item.price * item.quantity).toLocaleString()} د.ع
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-green-600 font-bold text-lg">
                💰 المجموع: {order.total.toLocaleString()} د.ع
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
