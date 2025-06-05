import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { name, storeName, location, email, password, storeLogo, role } = req.body;

  // ✅ تحقق من الحقول المطلوبة
  if (!name || !storeName || !location || !email || !password || !storeLogo || !role) {
    return res.status(400).json({ error: "❗ جميع الحقول مطلوبة" });
  }

  try {
    await connectToDatabase();
    console.log("✅ تم الاتصال بقاعدة البيانات");

    // ✅ التحقق من البريد الإلكتروني
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "❗ هذا البريد مسجّل مسبقًا" });
    }

    // ✅ التحقق من اسم المتجر
    const existingStore = await User.findOne({ storeName });
    if (existingStore) {
      return res.status(400).json({ error: "❗ اسم المتجر مستخدم، اختر اسمًا آخر" });
    }

    // ✅ تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ إنشاء المستخدم الجديد
    const user = await User.create({
      name,
      storeName,
      location, // ✅ المحافظة
      storeLogo,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      message: "✅ تم إنشاء الحساب بنجاح",
      userId: user._id,
    });
  } catch (error: any) {
    console.error("❌ فشل أثناء التسجيل:", error);
    return res.status(500).json({ error: "⚠️ خطأ في السيرفر: " + error.message });
  }
}
