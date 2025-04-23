import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login"); // إعادة التوجيه إذا ماكو JWT
    } else {
      setIsAuthenticated(true); // تم تسجيل الدخول
    }
  }, []);

  if (!isAuthenticated) return null; // لا تعرض شيء إذا غير مسجل

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">📊 لوحة التحكم</h1>
      <p>مرحبًا بك! تم تسجيل دخولك بنجاح 🔐</p>
    </div>
  );
}
