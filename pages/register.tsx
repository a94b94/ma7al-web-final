import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeLogo, setStoreLogo] = useState(""); // ✅ تعديل هنا
  const [role, setRole] = useState("manager");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !storeName || !email || !password || !storeLogo) {
      toast.error("❗ جميع الحقول مطلوبة بما فيها الشعار");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          storeName,
          email,
          password,
          storeLogo, // ✅ تعديل هنا
          role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ تم إنشاء الحساب بنجاح");
        router.push("/login");
      } else {
        toast.error(data.error || "❌ فشل في إنشاء الحساب");
      }
    } catch (err) {
      toast.error("❌ حدث خطأ أثناء التسجيل");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadLogo = () => {
    // @ts-ignore
    const dialog = window.uploadcare.openDialog(null, {
      publicKey: "767dc761271f23d1f796",
      imagesOnly: true,
    });

    dialog.done((file: any) => {
      file.done((info: any) => {
        setStoreLogo(info.cdnUrl); // ✅ تعديل هنا
        toast.success("✅ تم رفع الشعار");
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow rounded-xl p-6 w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-blue-700">
          📝 إنشاء حساب جديد
        </h1>

        <input
          type="text"
          placeholder="👤 الاسم الكامل"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="text"
          placeholder="🏪 اسم المتجر"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="email"
          placeholder="📧 البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <input
          type="password"
          placeholder="🔒 كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-xl"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-3 rounded-xl text-gray-700"
        >
          <option value="owner">🏪 صاحب المحل</option>
          <option value="manager">👨‍💼 موظف (مدير)</option>
          <option value="support">🛠️ دعم فني</option>
        </select>

        <button
          type="button"
          onClick={handleUploadLogo}
          className="w-full bg-gray-100 text-blue-600 py-2 rounded-xl hover:bg-gray-200 transition font-semibold"
        >
          📤 {storeLogo ? "تم رفع الشعار ✅" : "رفع شعار المتجر"}
        </button>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
          disabled={isLoading}
        >
          {isLoading ? "⏳ جاري التسجيل..." : "إنشاء الحساب"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-2">
          لديك حساب؟{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            تسجيل الدخول
          </Link>
        </p>

        <script
          src="https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js"
          data-public-key="767dc761271f23d1f796"
          defer
        ></script>
      </form>
    </div>
  );
}
