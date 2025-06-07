// pages/admin/store.tsx
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import Link from "next/link";

export default function StoreDashboard() {
  const { user } = useUser();
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setStoreData({
        name: user.name,
        storeName: user.storeName,
        email: user.email,
        logo: user.storeLogo,
        location: user.location,
        role: user.role,
      });
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="p-6 text-center">⏳ جاري تحميل بيانات المتجر...</div>;
  }

  if (!storeData) {
    return <div className="p-6 text-center text-red-500">❌ لم يتم العثور على بيانات المتجر.</div>;
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">🏪 لوحة تحكم المتجر</h1>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Image
            src={storeData.logo || "/images/default-store.png"}
            alt="شعار المتجر"
            width={120}
            height={120}
            className="rounded-full border shadow"
          />
          <div>
            <p className="text-xl font-bold">{storeData.storeName}</p>
            <p className="text-gray-600">👤 {storeData.name}</p>
            <p className="text-gray-600">📧 {storeData.email}</p>
            <p className="text-gray-600">📍 {storeData.location}</p>
            <p className="text-gray-600">🎖️ الصلاحية: {storeData.role === "owner" ? "صاحب المحل" : storeData.role === "manager" ? "مدير" : "دعم فني"}</p>
          </div>
        </div>

        <Link
          href="/admin/settings"
          className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          ⚙️ تعديل بيانات المتجر
        </Link>
      </div>
    </AdminLayout>
  );
}
