import { useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";

type StatusRes = {
  connected: boolean;
  qr: string | null;
  error?: string;
};

export default function WhatsAppQRPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // نستخدم ref حتى ما نعيد setQr لنفس الصورة
  const lastQrRef = useRef<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/status", { cache: "no-store" });

      if (!res.ok) {
        let msg = "❌ لا يوجد اتصال أو QR متاح حالياً";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {}
        throw new Error(msg);
      }

      const data = (await res.json()) as StatusRes;

      setIsReady(Boolean(data.connected));

      // إذا متصل: نخفي QR
      if (data.connected) {
        setQr(null);
        lastQrRef.current = null;
        setError("");
        return;
      }

      // إذا غير متصل: نعرض QR إن وجد
      if (typeof data.qr === "string" && data.qr.length > 0) {
        if (data.qr !== lastQrRef.current) {
          lastQrRef.current = data.qr;
          setQr(data.qr);
        }
        setError("");
      } else {
        setQr(null);
        lastQrRef.current = null;
        setError(data.error || "❌ لا يوجد QR حالياً");
      }
    } catch (err: any) {
      setQr(null);
      lastQrRef.current = null;
      setIsReady(false);
      setError(err?.message || "⚠️ فشل في جلب الحالة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus(); // أول تحميل

    // تحديث تلقائي كل 5 ثواني إلى أن يصير connected
    const t = setInterval(() => {
      fetchStatus();
    }, 5000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flyQrPage =
    process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL
      ? `${process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL.replace(/\/+$/, "")}/qr`
      : null;

  return (
    <AdminLayout>
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">🔒 ربط WhatsApp</h1>

        {loading && <p className="text-gray-500">🔄 جاري التحميل...</p>}

        {!loading && isReady && (
          <p className="text-green-600 font-semibold text-lg">
            ✅ متصل في حسابك على واتساب
          </p>
        )}

        {!loading && qr && !isReady && (
          <div className="flex flex-col items-center gap-4 mt-6">
            <img
              src={qr}
              alt="QR Code"
              className="w-64 h-64 border rounded-xl"
            />
            <p className="text-gray-700 text-sm">📲 امسح الكود من تطبيق واتساب</p>

            {flyQrPage && (
              <a
                href={flyQrPage}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline text-sm"
              >
                فتح صفحة QR مباشرة
              </a>
            )}
          </div>
        )}

        {!loading && !qr && !isReady && (
          <p className="text-red-600 mt-4 text-sm">
            {error || "❌ لا يوجد QR حالياً"}
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button onClick={fetchStatus} className="bg-blue-600 text-white hover:bg-blue-700">
            🔄 إعادة التحميل
          </Button>

          {flyQrPage && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(flyQrPage, "_blank")}
            >
              🔗 فتح /qr
            </Button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
