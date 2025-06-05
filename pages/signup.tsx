"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [role, setRole] = useState("manager");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !storeName || !location || !email || !password || !storeLogo) {
      toast.error("❗ جميع الحقول مطلوبة، بما فيها الموقع والشعار");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          storeName,
          location,
          email,
          password,
          storeLogo,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "❌ حدث خطأ أثناء التسجيل");
        return;
      }

      toast.success("✅ تم إنشاء الحساب بنجاح");
      router.push("/login");
    } catch {
      toast.error("❌ فشل الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadLogo = () => {
    // @ts-ignore
    const dialog = window.uploadcare.openDialog(null, {
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-md rounded-xl p-6 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-blue-700">📝 إنشاء حساب مشرف</h1>

        <input
          type="text"
          placeholder="👤 اسم المشرف"
          className="w-full p-3 border rounded-xl"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="🏪 اسم المتجر"
          className="w-full p-3 border rounded-xl"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-3 border rounded-xl text-gray-700"
        >
          <option value="">📍 اختر المحافظة</option>
          <option value="بغداد">بغداد</option>
          <option value="أربيل">أربيل</option>
          <option value="البصرة">البصرة</option>
          <option value="نينوى">نينوى</option>
          <option value="النجف">النجف</option>
          <option value="ذي قار">ذي قار</option>
          <option value="صلاح الدين">صلاح الدين</option>
        </select>

        <input
          type="email"
          placeholder="📧 البريد الإلكتروني"
          className="w-full p-3 border rounded-xl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="🔒 كلمة المرور"
          className="w-full p-3 border rounded-xl"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full p-3 border rounded-xl text-gray-700"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="owner">🏪 صاحب المتجر</option>
          <option value="manager">👨‍💼 مدير</option>
          <option value="support">🛠️ دعم فني</option>
        </select>

        <button
          type="button"
          onClick={handleUploadLogo}
          className="w-full bg-gray-100 text-blue-600 py-2 rounded-xl hover:bg-gray-200 transition font-semibold"
        >
          📤 {storeLogo ? "✅ تم رفع الشعار" : "رفع شعار المتجر"}
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
        >
          {isLoading ? "⏳ جاري التسجيل..." : "تسجيل الحساب"}
        </button>

        {/* Uploadcare Script */}
        <script
          src="https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js"
          data-public-key="767dc761271f23d1f796"
          defer
        ></script>
      </form>
    </div>
  );
}
