// pages/api/user/update-profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "Abdullaha94b1994ASDF";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "🚫 Method Not Allowed" });
  }

  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "🚫 غير مصرح لك" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch {
      return res.status(401).json({ success: false, message: "🚫 رمز التحقق غير صالح" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "⚠️ المستخدم غير موجود" });
    }

    const { name, email, photo, password } = req.body;

    if (name && typeof name === "string") user.name = name.trim();
    if (email && typeof email === "string") user.email = email.toLowerCase().trim();
    if (photo && typeof photo === "string") user.image = photo;

    if (password) {
      if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "🔒 كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const newToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ تجديد الكوكيز بعد التحديث
    res.setHeader("Set-Cookie", serialize("token", newToken, {
      path: "/",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    }));

    return res.status(200).json({
      success: true,
      message: "✅ تم تحديث المعلومات بنجاح",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("❌ خطأ في تحديث الملف:", error.message || error);
    return res.status(500).json({ success: false, message: "❌ حدث خطأ داخلي في السيرفر" });
  }
}
