import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { name, storeName, location, email, password, storeLogo, role = "manager", phone = "" } = req.body;

  // ✅ تحقق من الحقول الأساسية
  if (!name || !storeName || !location || !email || !password || !storeLogo) {
    return res.status(400).json({ error: "❗ جميع الحقول مطلوبة" });
  }

  // ✅ تحقق إضافي (تنسيق البريد وكلمة المرور)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "❌ البريد الإلكتروني غير صالح" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "🔒 كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
  }

  try {
    await connectToDatabase();

    // تحقق من وجود المستخدم مسبقًا
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "❗ هذا البريد مسجّل مسبقًا" });
    }

    // تحقق من وجود المتجر مسبقًا
    const existingStore = await Store.findOne({ name: storeName });
    if (existingStore) {
      return res.status(400).json({ error: "❗ اسم المتجر مستخدم، اختر اسمًا آخر" });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // إنشاء المتجر وربطه بالمستخدم
    const store = await Store.create({
      name: storeName,
      phone,
      logo: storeLogo,
      ownerId: user._id,
      location,
    });

    return res.status(201).json({
      success: true,
      message: "✅ تم إنشاء الحساب والمتجر بنجاح",
      userId: user._id,
      storeId: store.storeId || store._id,
    });

  } catch (error: any) {
    console.error("❌ فشل أثناء التسجيل:", error);
    return res.status(500).json({ error: "⚠️ خطأ في السيرفر: " + error.message });
  }
}
