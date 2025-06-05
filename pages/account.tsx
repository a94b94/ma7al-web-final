// pages/account.tsx
"use client";

import { useRouter } from "next/router";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";
import { LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { user, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* ✅ صورة واسم المشرف */}
        <div className="flex flex-col items-center mb-6">
          {user.image && (
            <img
              src={user.image}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover shadow mb-3"
              loading="lazy"
            />
          )}
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.storeName}</p>
        </div>

        {/* ✅ الأزرار */}
        <div className="space-y-4">
          <Button
            onClick={() => router.push("/admin")}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <LayoutDashboard size={18} />
            لوحة التحكم
          </Button>

          <Button
            onClick={() => router.push("/admin/settings/profile")}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Settings size={18} />
            الإعدادات الشخصية
          </Button>

          <Button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center gap-2"
            variant="destructive"
          >
            <LogOut size={18} />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
}
