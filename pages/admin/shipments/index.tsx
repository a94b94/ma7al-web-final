"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import toast from "react-hot-toast";

interface Shipment {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "shipped" | "delivered" | "cancelled">("all");

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await axios.get("/api/shipments");
      setShipments(res.data || []);
    } catch (err) {
      toast.error("فشل في تحميل بيانات الشحنات");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: Shipment["status"]) => {
    try {
      await axios.put(`/api/shipments/${id}`, { status: newStatus });
      toast.success("تم تحديث الحالة");
      fetchShipments();
    } catch (err) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const filteredShipments =
    filter === "all" ? shipments : shipments.filter((s) => s.status === filter);

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🚚 إدارة الشحنات</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value="all">الكل</option>
          <option value="pending">بانتظار الشحن</option>
          <option value="shipped">جاري التوصيل</option>
          <option value="delivered">تم التوصيل</option>
          <option value="cancelled">ملغاة</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white border rounded shadow-sm">
        <table className="w-full table-auto text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-right">#</th>
              <th className="p-3 text-right">رقم الطلب</th>
              <th className="p-3 text-right">الزبون</th>
              <th className="p-3 text-right">الهاتف</th>
              <th className="p-3 text-right">الحالة</th>
              <th className="p-3 text-right">تاريخ الإنشاء</th>
              <th className="p-3 text-right">تحكم</th>
            </tr>
          </thead>
          <tbody>
            {filteredShipments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500">
                  لا توجد شحنات حالياً.
                </td>
              </tr>
            ) : (
              filteredShipments.map((s, i) => (
                <tr key={s._id} className="border-t">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{s.orderId}</td>
                  <td className="p-3">{s.customerName}</td>
                  <td className="p-3">{s.customerPhone}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        s.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : s.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : s.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.status === "pending"
                        ? "بانتظار"
                        : s.status === "shipped"
                        ? "جاري التوصيل"
                        : s.status === "delivered"
                        ? "تم التوصيل"
                        : "ملغاة"}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 space-x-1">
                    {s.status !== "delivered" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(s._id, "delivered")}
                      >
                        تأكيد التوصيل
                      </Button>
                    )}
                    {s.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(s._id, "cancelled")}
                      >
                        إلغاء
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
