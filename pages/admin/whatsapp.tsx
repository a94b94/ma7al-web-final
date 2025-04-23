
import { useEffect, useState } from "react";
import Head from "next/head";

export default function WhatsAppPage() {
  const [qrCode, setQrCode] = useState<string>("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5000/status");
        const data = await res.json();

        if (data.connected) {
          setConnected(true);
          setQrCode("");
          clearInterval(interval);
        } else if (data.qr) {
          setQrCode(data.qr);
          setConnected(false);
        }
      } catch (err) {
        console.error("خطأ أثناء جلب QR:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Head>
        <title>ربط واتساب - لوحة التحكم</title>
      </Head>

      <h1 className="text-2xl font-bold mb-4">🔗 ربط حساب واتساب</h1>

      {connected ? (
        <div className="bg-green-100 text-green-800 px-4 py-3 rounded shadow">
          ✅ تم ربط حساب واتساب بنجاح. الآن يمكن إرسال الرسائل تلقائيًا عند تنفيذ الطلبات.
        </div>
      ) : (
        <div className="bg-white shadow p-6 rounded-md">
          <p className="mb-4 text-gray-700">📱 امسح QR أدناه باستخدام تطبيق واتساب لتفعيل الربط:</p>
          {qrCode ? (
            <img src={qrCode} alt="QR Code" className="mx-auto border p-2 rounded" />
          ) : (
            <p className="text-gray-500 text-center">⏳ جاري التحميل...</p>
          )}
        </div>
      )}
    </div>
  );
}
