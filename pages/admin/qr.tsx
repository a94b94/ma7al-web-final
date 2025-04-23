import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

export default function WhatsAppQRPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQr = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp"); // 🟢 هنا التعديل
      if (!res.ok) throw new Error("❌ لا يوجد اتصال أو QR متاح حالياً");
      const data = await res.json();
      setQr(data.qr);
      setIsReady(data.isReady);
      setError("");
    } catch (err: any) {
      setQr(null);
      setIsReady(false);
      setError(err.message || "⚠️ فشل في جلب QR");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQr();
    const interval = setInterval(fetchQr, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">🔒 ربط WhatsApp</h1>

        {loading && <p className="text-gray-500">🔄 جاري التحميل...</p>}

        {!loading && isReady && (
          <p className="text-green-600 font-semibold text-lg">✅ تم ربط واتساب بنجاح</p>
        )}

        {!loading && qr && !isReady && (
          <div className="flex flex-col items-center gap-4 mt-6">
            <img src={qr} alt="QR Code" className="w-64 h-64" />
            <p className="text-gray-700 text-sm">📲 امسح الكود من تطبيق واتساب</p>
          </div>
        )}

        {!loading && !qr && !isReady && (
          <p className="text-red-600 mt-4 text-sm">{error || "❌ لا يوجد QR حالياً"}</p>
        )}

        <div className="mt-6">
          <Button onClick={fetchQr} className="bg-blue-600 text-white hover:bg-blue-700">
            🔄 إعادة التحميل
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
