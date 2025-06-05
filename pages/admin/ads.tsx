import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

interface Ad {
  _id: string;
  title: string;
  description: string;
  expiresAt: string;
  productId: {
    _id: string;
    name: string;
  };
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/ads")
      .then(res => setAds(res.data))
      .catch(() => toast.error("فشل تحميل الإعلانات"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📢 الإعلانات</h1>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : (
          <div className="space-y-4">
            {ads.length === 0 ? (
              <p>لا توجد إعلانات حالياً.</p>
            ) : (
              ads.map((ad) => (
                <div key={ad._id} className="border rounded p-4 shadow-sm bg-white">
                  <h2 className="text-xl font-semibold mb-1">{ad.title}</h2>
                  <p className="text-gray-700 mb-2">{ad.description}</p>
                  <p className="text-sm text-gray-500">🔗 المنتج: {ad.productId?.name}</p>
                  <p className="text-sm text-gray-500">⏰ ينتهي في: {new Date(ad.expiresAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-6">
          <Link href="/admin/create-ad" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            ➕ إنشاء إعلان جديد
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
