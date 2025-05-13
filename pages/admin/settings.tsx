import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function AdminSettingsPage() {
  const { user } = useUser();
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setStoreName(user.storeName || "");
      setStoreLogo(user.storeLogo || "");
      setWhatsappNumber(user.whatsappNumber || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10,15}$/.test(whatsappNumber)) {
      toast.error("❌ رقم الواتساب غير صحيح");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/admin/settings", {
        userId: user._id,
        storeName,
        storeLogo,
        whatsappNumber,
      });
      toast.success("✅ تم حفظ التعديلات بنجاح");
    } catch (err) {
      toast.error("فشل في حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const openUploadcare = () => {
    const dialog = (window as any).uploadcare.openDialog(null, {
      publicKey: "767dc761271f23d1f796",
      imagesOnly: true,
    });
    dialog.done((file: any) => {
      file.done((info: any) => {
        setStoreLogo(info.cdnUrl);
      });
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">⚙️ إعدادات المتجر</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">اسم المتجر</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">رقم واتساب</label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="مثال: 9647701234567"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">رابط شعار المتجر</label>
          <input
            type="text"
            value={storeLogo}
            onChange={(e) => setStoreLogo(e.target.value)}
            placeholder="رابط صورة من Uploadcare"
            className="w-full rounded border px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="button"
            onClick={openUploadcare}
            className="text-sm text-blue-600 mt-1 underline"
          >
            اختر صورة من Uploadcare
          </button>
          {storeLogo && (
            <img src={storeLogo} alt="شعار المتجر" className="mt-3 h-20" />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>
    </div>
  );
}
