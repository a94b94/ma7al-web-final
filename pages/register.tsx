"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Link from "next/link";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [location, setLocation] = useState("");
  const [role, setRole] = useState("owner");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const firebaseUser = result.user;

      const res = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ تم تسجيل الدخول بـ Google");

        // ✅ حفظ المستخدم
        localStorage.setItem("token", data.token);
        localStorage.setItem("ma7al-user", JSON.stringify(data.user));
        setUser(data.user);

        // ✅ توجيه حسب الدور
        if (["owner", "manager"].includes(data.user.role)) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        toast.error(data.error || "❌ فشل تسجيل الدخول بـ Google");
      }
    } catch (error) {
      console.error(error);
      toast.error("⚠️ فشل تسجيل الدخول بـ Google");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !storeName || !storeLogo || !whatsappNumber || !location) {
      toast.error("❗ جميع الحقول مطلوبة");
      return;
    }

    const cleanedNumber = whatsappNumber.replace(/^\+?964|^0/, "");
    if (!/^\d{9,11}$/.test(cleanedNumber)) {
      toast.error("❌ رقم واتساب غير صالح");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          storeName: storeName.trim(),
          storeLogo,
          whatsappNumber: `964${cleanedNumber}`,
          location,
          role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ تم إنشاء الحساب بنجاح");
        router.push("/login");
      } else {
        toast.error(data.message || "❌ حدث خطأ أثناء التسجيل");
      }
    } catch {
      toast.error("⚠️ حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadLogo = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
          📝 إنشاء حساب مشرف
        </h2>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
        >
          🔐 التسجيل عبر Google
        </button>

        <div className="border-b my-4"></div>

        <input type="text" placeholder="👤 الاسم الكامل" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-3 rounded" />
        <input type="email" placeholder="📧 البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded" />
        <input type="password" placeholder="🔒 كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded" />
        <input type="text" placeholder="🏪 اسم المتجر" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full border p-3 rounded" />

        <button
          type="button"
          onClick={handleUploadLogo}
          className="w-full bg-gray-100 text-blue-600 py-2 rounded hover:bg-gray-200"
        >
          📤 {storeLogo ? "✅ تم رفع الشعار" : "رفع شعار المتجر"}
        </button>

        {storeLogo && (
          <img src={storeLogo} alt="Store Logo" className="w-20 h-20 rounded-full mx-auto border" />
        )}

        <input
          type="tel"
          placeholder="📱 رقم واتساب"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <select value={location} onChange={(e) => setLocation(e.target.value)} className="w-full border p-3 rounded text-gray-700">
          <option value="">📍 اختر المحافظة</option>
          {["بغداد", "أربيل", "البصرة", "نينوى", "النجف", "ذي قار", "صلاح الدين"].map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border p-3 rounded text-gray-700">
          <option value="owner">🏪 صاحب محل</option>
          <option value="manager">👨‍💼 مدير</option>
          <option value="support">🛠️ دعم فني</option>
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
        >
          {isLoading ? "⏳ جاري التسجيل..." : "إنشاء الحساب"}
        </button>

        <p className="text-center text-sm text-gray-600">
          لديك حساب؟{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            تسجيل الدخول
          </Link>
        </p>

        <script src="https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js" data-public-key="767dc761271f23d1f796" defer></script>
      </form>
    </div>
  );
}
