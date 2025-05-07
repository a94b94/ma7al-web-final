import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { name, storeName, email, password, storeLogo, role } = req.body;

  // ✅ التحقق من جميع الحقول المطلوبة
  if (!name || !storeName || !email || !password || !storeLogo || !role) {
    return res.status(400).json({ error: "❗ جميع الحقول مطلوبة" });
  }

  try {
    // ✅ الاتصال بقاعدة البيانات
    await connectToDatabase();
    console.log("✅ تم الاتصال بقاعدة البيانات");

    // ✅ تحقق من وجود المستخدم بالإيميل
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "❗ المستخدم موجود مسبقاً" });
    }

    // ✅ تحقق من تكرار اسم المتجر
    const existingStore = await User.findOne({ storeName });
    if (existingStore) {
      return res.status(400).json({ error: "❗ اسم المتجر مستخدم مسبقًا، الرجاء اختيار اسم آخر" });
    }

    // ✅ تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ إنشاء المستخدم
    const user = await User.create({
      name,
      storeName,
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
    return res.status(500).json({ error: "❌ فشل في إنشاء الحساب: " + error.message });
  }
}
