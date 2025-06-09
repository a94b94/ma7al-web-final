// ✅ ملف: pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "❌ Method Not Allowed" });
  }

  const {
    name,
    storeName,
    location,
    email,
    password,
    storeLogo,
    role = "manager",
    phone = "",
  } = req.body;

  if (
    !name?.trim() ||
    !storeName?.trim() ||
    !location?.trim() ||
    !email?.trim() ||
    !password ||
    !storeLogo?.trim()
  ) {
    return res.status(400).json({ success: false, message: "❗ جميع الحقول مطلوبة" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "❌ البريد الإلكتروني غير صالح" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "🔒 كلمة المرور يجب أن تكون 6 أحرف على الأقل",
    });
  }

  try {
    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const cleanedStoreName = storeName.trim();

    // 🔎 تحقق من البريد الإلكتروني
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "📧 البريد مسجّل مسبقًا" });
    }

    // 🔎 تحقق من اسم المتجر (بشكل غير حساس لحالة الأحرف)
    const existingStore = await Store.findOne({ name: new RegExp(`^${cleanedStoreName}$`, "i") });
    if (existingStore) {
      return res.status(400).json({ success: false, message: "🏪 اسم المتجر مستخدم مسبقًا" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ إنشاء المستخدم
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    });

    // ✅ إنشاء المتجر وربطه بالمستخدم
    const store = await Store.create({
      name: cleanedStoreName,
      phone: phone.trim(),
      logo: storeLogo.trim(),
      ownerId: user._id,
      location: location.trim(),
    });

    // ✅ تحديث المستخدم لربط المتجر
    user.storeName = store.name;
    user.storeLogo = store.logo;
    user.address = store.location;
    user.phone = store.phone;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "✅ تم إنشاء الحساب والمتجر بنجاح",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        storeLogo: user.storeLogo,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error: any) {
    console.error("❌ فشل أثناء التسجيل:", error);
    return res.status(500).json({
      success: false,
      message: "⚠️ حدث خطأ في السيرفر",
      error: error.message,
    });
  }
}
