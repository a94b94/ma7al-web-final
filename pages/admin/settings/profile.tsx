// ✅ نسخة مطورة تدعم رفع صورة المستخدم إلى Cloudinary مع حذف القديمة

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

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        // حذف الصورة القديمة إذا كانت من Cloudinary
        if (photo && photo.includes("res.cloudinary.com")) {
          const publicId = photo.split("/").slice(-1)[0].split(".")[0];
          await axios.post("/api/delete-image", { public_id: `ma7al-store/${publicId}` });
        }

        const res = await axios.post("/api/upload", { imageBase64: reader.result });
        setPhoto(res.data.url);
        toast.success("✅ تم رفع الصورة الشخصية");
      } catch {
        toast.error("❌ فشل في رفع الصورة");
      }
    };
    reader.readAsDataURL(file);
  };

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
        setUser(res.data.updatedUser);
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
            <label className="block mb-1 font-medium">🖼️ الصورة الشخصية</label>
            <input type="file" accept="image/*" onChange={handleUploadPhoto} />
            {photo && (
              <img
                src={photo}
                alt="الصورة الشخصية"
                className="mt-2 w-24 h-24 rounded border object-cover"
              />
            )}
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
