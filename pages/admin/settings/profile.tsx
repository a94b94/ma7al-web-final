// pages/admin/settings/profile.tsx
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProfileSettingsPage() {
  const { user, setUser } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoto(user.photo || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }

    try {
      const res = await axios.post("/api/user/update-profile", {
        name,
        email,
        photo,
        password,
      });

      if (res.data.success) {
        toast.success("✅ تم تحديث البيانات");
        setUser(res.data.updatedUser); // تحديث السياق
      } else {
        toast.error(res.data.message || "حدث خطأ");
      }
    } catch (err) {
      toast.error("❌ فشل في التحديث");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">🧑‍💼 تعديل الملف الشخصي</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">👤 الاسم الكامل</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block mb-1 font-medium">📧 البريد الإلكتروني</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <label className="block mb-1 font-medium">🖼️ رابط الصورة الشخصية</label>
            <Input value={photo} onChange={(e) => setPhoto(e.target.value)} />
            {/* يمكنك هنا استبداله برفع Uploadcare لاحقًا */}
          </div>

          <div>
            <label className="block mb-1 font-medium">🔒 كلمة مرور جديدة (اختياري)</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {password && (
            <div>
              <label className="block mb-1 font-medium">🔁 تأكيد كلمة المرور</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            💾 حفظ التعديلات
          </Button>
        </form>
      </div>
    </AdminLayout>
  );
}
