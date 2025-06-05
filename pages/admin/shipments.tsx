"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

interface Shipment {
  _id: string;
  supplier?: string;
  note?: string;
  reference?: string;
  products: { productId: string; quantity: number }[];
  receivedAt: string;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shipments/list")
      .then((res) => res.json())
      .then((data) => {
        setShipments(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setShipments([]);
      });
  }, []);

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">📦 قائمة الشحنات</h1>

        {loading ? (
          <p>⏳ جاري التحميل...</p>
        ) : shipments.length === 0 ? (
          <p>🚫 لا توجد شحنات مسجلة.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">رقم</th>
                  <th className="p-2 border">المورد</th>
                  <th className="p-2 border">عدد المنتجات</th>
                  <th className="p-2 border">التاريخ</th>
                  <th className="p-2 border">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s, i) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="p-2 border text-center">{i + 1}</td>
                    <td className="p-2 border text-center">{s.supplier || "غير معروف"}</td>
                    <td className="p-2 border text-center">{s.products.length}</td>
                    <td className="p-2 border text-center">{new Date(s.receivedAt).toLocaleDateString()}</td>
                    <td className="p-2 border text-center text-sm">{s.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
