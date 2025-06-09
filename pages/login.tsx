"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
        localStorage.setItem("ma7al-user", JSON.stringify(data.user));
        setUser(data.user);
        setSuccess("✅ تم تسجيل الدخول بنجاح");

        setTimeout(() => {
          router.replace(["owner", "manager"].includes(data.user.role) ? "/admin" : "/");
        }, 1200);
      }
    } catch {
      setError("⚠️ حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/admin/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "❌ فشل تسجيل الدخول بواسطة Google");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("ma7al-user", JSON.stringify(data.user));
        setUser(data.user);
        setSuccess("✅ تم تسجيل الدخول بواسطة Google");

        setTimeout(() => {
          router.replace(["owner", "manager"].includes(data.user.role) ? "/admin" : "/");
        }, 1200);
      }
    } catch (err) {
      console.error("❌ Google Sign-in Error:", err);
      setError("⚠️ فشل تسجيل الدخول باستخدام Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6">
      <motion.form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          🔐 تسجيل دخول المشرف
        </h1>

        {error && (
          <motion.p
            className="text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300 text-center p-2 rounded"
            initial={{ x: 0 }}
            animate={{ x: [0, -10, 10, -10, 10, 0] }}
            transition={{ duration: 0.4 }}
          >
            {error}
          </motion.p>
        )}

        {success && (
          <motion.p
            className="text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 text-center p-2 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {success}
          </motion.p>
        )}

        <input
          type="email"
          placeholder="📧 البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="🔑 كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 pr-12 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="text-right text-sm text-blue-600 hover:underline">
          <a href="/forgot-password">🔁 نسيت كلمة المرور؟</a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <LogIn size={18} />
          {loading ? "🔄 جارٍ التحقق..." : "تسجيل الدخول"}
        </button>

        <div className="flex items-center justify-center my-4">
          <span className="h-px w-1/3 bg-gray-300 dark:bg-gray-600" />
          <span className="px-3 text-sm text-gray-500 dark:text-gray-400">أو</span>
          <span className="h-px w-1/3 bg-gray-300 dark:bg-gray-600" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full bg-white border hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          {googleLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
              alt="Google"
              className="w-5 h-5"
            />
          )}
          {googleLoading ? "جاري الدخول..." : "تسجيل الدخول بواسطة Google"}
        </button>
      </motion.form>
    </div>
  );
}
