import { useEffect, useState } from "react";
import Head from "next/head";
import { useUser } from "@/context/UserContext";

export default function WhatsAppPage() {
  const { user } = useUser();
  const [qrCode, setQrCode] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/status");
        const data = await res.json();

        if (data.connected) {
          setConnected(true);
          setQrCode("");
        } else if (data.qr) {
          setQrCode(data.qr);
          setConnected(false);
        }
      } catch (err) {
        console.error("❌ خطأ أثناء الاتصال بسيرفر واتساب:", err);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchStatus, 4000);
    fetchStatus(); // أول مرة مباشرة

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <Head>
        <title>ربط واتساب - لوحة التحكم</title>
      </Head>

      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow rounded p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">🔗 ربط حساب واتساب</h1>

        {user && (
          <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-300">
            👋 أهلاً {user.name}، الرجاء ربط حساب واتساب الخاص بك لمتابعة إرسال الفواتير.
          </p>
        )}

        {loading ? (
          <p className="text-center">⏳ جاري التحميل...</p>
        ) : connected ? (
          <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-4 py-3 rounded text-center shadow">
            ✅ تم ربط الحساب بنجاح، يمكنك الآن إرسال الرسائل تلقائيًا.
          </div>
        ) : qrCode ? (
          <>
            <p className="text-center mb-4">📱 امسح رمز QR التالي من تطبيق واتساب:</p>
            <div className="flex justify-center">
              <img src={qrCode} alt="QR Code" className="w-60 h-60 border p-2 rounded bg-white" />
            </div>
          </>
        ) : (
          <p className="text-center text-red-500">⚠️ لم يتم جلب QR، تحقق من عمل السيرفر المحلي.</p>
        )}
      </div>
    </div>
  );
}
