"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "❌ فشل تسجيل الدخول");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        setSuccess("✅ تم تسجيل الدخول بنجاح");
        setTimeout(() => router.push("/"), 1200);
      }
    } catch {
      setError("❌ حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          🔐 تسجيل دخول المشرف
        </h1>

        {error && (
          <p className="text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 text-center p-2 rounded">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 text-center p-2 rounded">
            {success}
          </p>
        )}

        <input
          type="email"
          placeholder="📧 البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <input
          type="password"
          placeholder="🔑 كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? "🔄 جارٍ التحقق..." : "تسجيل الدخول"}
        </button>
      </form>
    </div>
  );
}
