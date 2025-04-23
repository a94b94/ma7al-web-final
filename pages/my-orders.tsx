
import { useEffect, useState } from "react";
import { useUser } from "./_app";

export default function MyOrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user?.token) return;
    fetch("/api/my-orders", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));
  }, [user]);

  if (!user) {
    return (
      <div className="p-6 text-center text-red-600 font-bold">
        يجب تسجيل الدخول لعرض الطلبات
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">📦 طلباتي</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">لا توجد طلبات حتى الآن.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div
              key={order._id}
              className="bg-white p-4 rounded-xl shadow border"
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-700">
                  🆔 رقم الطلب: {order._id}
                </p>
                <p className="text-sm text-gray-500">
                  📅 {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <p className="text-sm text-blue-600 mt-1">
                🟡 الحالة: {order.status || "قيد المعالجة"}
              </p>

              <p className="mt-1">📍 العنوان: {order.address}</p>
              <p>📞 الهاتف: {order.phone}</p>

              <ul className="mt-2 list-disc ps-6 text-sm text-gray-600">
                {order.cart.map((item: any, idx: number) => (
                  <li key={idx}>
                    {item.name} × {item.quantity} —{" "}
                    {(item.price * item.quantity).toLocaleString()} د.ع
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-green-600 font-bold">
                💰 المجموع: {order.total.toLocaleString()} د.ع
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
