// pages/admin/settings.tsx
"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/router";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  const { user } = useUser();
  const router = useRouter();

  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [heroImages, setHeroImages] = useState({
    phone: "",
    appliance: "",
    background: "",
  });

  useEffect(() => {
    if (user) {
      setStoreName(user.storeName || "");
      setStoreLogo(user.storeLogo || "");
      setWhatsappNumber(user.whatsappNumber || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) router.push("/login");

    fetch("/api/settings/hero-images")
      .then((res) => res.json())
      .then((data) => setHeroImages(data))
      .catch(() => toast.error("❌ فشل تحميل صور الواجهة"));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("❗ يجب تسجيل الدخول أولاً");

    const cleanedNumber = whatsappNumber.replace(/^\+?964|^0/, "");
    if (!/^\d{9,11}$/.test(cleanedNumber)) {
      return toast.error("❌ رقم واتساب غير صالح (بدون رمز البلد)");
    }

    setLoading(true);
    try {
      await axios.post("/api/admin/settings", {
        userId: user._id,
        storeName,
        storeLogo,
        whatsappNumber: `964${cleanedNumber}`,
      });

      toast.success("✅ تم حفظ الإعدادات");
    } catch (err) {
      toast.error("❌ فشل حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const openUploadcare = () => {
    const dialog = (window as any).uploadcare.openDialog(null, {
      publicKey: "767dc761271f23d1f796",
      imagesOnly: true,
      crop: "1:1",
    });

    dialog.done((file: any) => {
      file.done((info: any) => {
        setStoreLogo(info.cdnUrl);
        toast.success("✅ تم رفع الشعار");
      });
    });
  };

  const handleHeroUpload = (type: "phone" | "appliance" | "background") => {
    const dialog = (window as any).uploadcare.openDialog(null, {
      publicKey: "767dc761271f23d1f796",
      imagesOnly: true,
    });

    dialog.done((file: any) => {
      file.done((info: any) => {
        const updated = { ...heroImages, [type]: info.cdnUrl };
        setHeroImages(updated);

        fetch("/api/settings/hero-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        })
          .then(() => toast.success("✅ تم تحديث الصورة"))
          .catch(() => toast.error("❌ فشل رفع الصورة"));
      });
    });
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Toaster />
      <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
        ⚙️ إعدادات المتجر
      </h2>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
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
            placeholder="مثال: 07701234567 أو +9647701234567"
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
            <motion.img
              src={storeLogo}
              alt="شعار المتجر"
              className="mt-3 h-20 rounded"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "⏳ جاري الحفظ..." : "💾 حفظ التعديلات"}
        </button>
      </motion.form>

      <hr className="my-8" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-4">🖼️ صور الواجهة الرئيسية</h3>
        <div className="space-y-4">
          {(["phone", "appliance", "background"] as const).map((type) => (
            <div key={type}>
              <button
                onClick={() => handleHeroUpload(type)}
                className="bg-blue-600 text-white py-2 px-4 rounded"
              >
                {type === "phone"
                  ? "📱 صورة الهاتف"
                  : type === "appliance"
                  ? "⚡ صورة الجهاز"
                  : "🌌 خلفية الواجهة"}
              </button>
              {heroImages[type] && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Image
                    src={heroImages[type]}
                    alt={`صورة ${type}`}
                    width={150}
                    height={type === "background" ? 80 : 150}
                    className="rounded shadow mt-2"
                  />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <input type="hidden" role="uploadcare-uploader" />
    </motion.div>
  );
}
