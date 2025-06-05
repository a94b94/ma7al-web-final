"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("manager");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, storeName, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "❌ حدث خطأ أثناء التسجيل");
        return;
      }

      toast.success("✅ تم إنشاء الحساب بنجاح");
      router.push("/login");
    } catch (err) {
      toast.error("❌ فشل الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
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
          required
        />

        <input
          type="text"
          placeholder="🏪 اسم المتجر"
          className="w-full p-3 border rounded-xl"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="📧 البريد الإلكتروني"
          className="w-full p-3 border rounded-xl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="🔒 كلمة المرور"
          className="w-full p-3 border rounded-xl"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
          disabled={isLoading}
        >
          {isLoading ? "⏳ جاري التسجيل..." : "تسجيل الحساب"}
        </button>
      </form>
    </div>
  );
}
