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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "❌ فشل تسجيل الدخول");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setSuccess("✅ تم تسجيل الدخول بنجاح");
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setError("❌ حدث خطأ أثناء تسجيل الدخول");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">🔐 تسجيل دخول</h1>
        {error && <p className="text-red-600 text-center">{error}</p>}
        {success && <p className="text-green-600 text-center">{success}</p>}
        <input
          type="email"
          placeholder="📧 البريد الإلكتروني"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 border rounded-xl"
          required
        />
        <input
          type="password"
          placeholder="🔑 كلمة المرور"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 border rounded-xl"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl">
          تسجيل الدخول
        </button>
      </form>
    </div>
  );
}
