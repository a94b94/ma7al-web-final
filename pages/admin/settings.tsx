import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";

export default function AdminSettingsPage() {
  const { user } = useUser();
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [heroImages, setHeroImages] = useState({ phone: "", appliance: "", background: "" });

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

    fetch("/api/settings/hero-images")
      .then((res) => res.json())
      .then((data) => setHeroImages(data));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("❗ يجب تسجيل الدخول أولاً");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(whatsappNumber)) {
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

  const handleHeroUpload = (type: "phone" | "appliance" | "background") => {
    const widget = (window as any).uploadcare.Widget("[role=uploadcare-uploader]");
    widget.openDialog(null, { publicKey: "767dc761271f23d1f796" }).done((fileInfo: any) => {
      const updated = { ...heroImages, [type]: fileInfo.cdnUrl };
      setHeroImages(updated);

      fetch("/api/settings/hero-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
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

      <hr className="my-8" />

      <h3 className="text-lg font-semibold mb-4">🖼️ صور الواجهة الرئيسية (Hero)</h3>

      <div className="space-y-4">
        <div>
          <button
            onClick={() => handleHeroUpload("phone")}
            className="bg-blue-600 text-white py-2 px-4 rounded"
          >
            📱 رفع صورة الهاتف
          </button>
          {heroImages.phone && (
            <Image src={heroImages.phone} alt="هاتف" width={150} height={150} className="rounded shadow mt-2" />
          )}
        </div>

        <div>
          <button
            onClick={() => handleHeroUpload("appliance")}
            className="bg-green-600 text-white py-2 px-4 rounded"
          >
            ⚡ رفع صورة الجهاز الكهربائي
          </button>
          {heroImages.appliance && (
            <Image src={heroImages.appliance} alt="جهاز" width={150} height={150} className="rounded shadow mt-2" />
          )}
        </div>

        <div>
          <button
            onClick={() => handleHeroUpload("background")}
            className="bg-purple-600 text-white py-2 px-4 rounded"
          >
            🌌 تغيير خلفية الهيرو
          </button>
          {heroImages.background && (
            <Image src={heroImages.background} alt="خلفية" width={150} height={80} className="rounded shadow mt-2" />
          )}
        </div>
      </div>

      <input type="hidden" role="uploadcare-uploader" />
    </div>
  );
}
