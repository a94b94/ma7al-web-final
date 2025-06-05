// pages/admin/shipments/[id].tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/admin/AdminLayout";
import dayjs from "dayjs";
import "dayjs/locale/ar";

interface ProductItem {
  sku: string;
  name: string;
  quantity: number;
  purchasePrice: number;
}

interface Shipment {
  _id: string;
  supplier?: string;
  products: ProductItem[];
  receivedAt: string;
  reference?: string;
  note?: string;
  storeId?: string;
}

export default function ShipmentDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/shipments/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setShipment(data.shipment);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setShipment(null);
        });
    }
  }, [id]);

  if (loading) return <div className="p-6">🔄 جاري تحميل التفاصيل...</div>;
  if (!shipment) return <div className="p-6 text-red-600">❌ لم يتم العثور على الشحنة</div>;

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <button
          onClick={() => router.push("/admin/shipments")}
          className="text-sm text-blue-600 hover:underline"
        >
          ← الرجوع إلى قائمة الشحنات
        </button>

        <h1 className="text-2xl font-bold">📦 تفاصيل الشحنة #{shipment._id}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded border">
          <p><strong>المورد:</strong> {shipment.supplier || "غير محدد"}</p>
          <p><strong>التاريخ:</strong> {dayjs(shipment.receivedAt).locale("ar").format("YYYY/MM/DD HH:mm")}</p>
          <p><strong>الرمز المرجعي:</strong> {shipment.reference || "---"}</p>
          <p><strong>الملاحظات:</strong> {shipment.note || "لا توجد"}</p>
        </div>

        <h2 className="text-xl font-semibold mt-6">📋 المنتجات المضافة</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2">الباركود</th>
                <th className="p-2">اسم المنتج</th>
                <th className="p-2">الكمية</th>
                <th className="p-2">سعر الشراء</th>
              </tr>
            </thead>
            <tbody>
              {shipment.products.map((p, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.quantity}</td>
                  <td className="p-2">{p.purchasePrice.toLocaleString()} د.ع</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
