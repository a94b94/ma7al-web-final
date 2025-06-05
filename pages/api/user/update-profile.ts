// pages/api/user/update-profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Abdullaha94b1994ASDF";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "غير مصرح" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch {
      return res.status(401).json({ success: false, message: "رمز الدخول غير صالح" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });
    }

    const { name, email, photo, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (photo) user.image = photo; // حقل الصورة الصحيح
    if (password && password.length >= 6) {
      user.password = await bcrypt.hash(password, 10);
    } else if (password) {
      return res.status(400).json({ success: false, message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
    }

    await user.save();

    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
    };

    res.status(200).json({ success: true, updatedUser });
  } catch (error: any) {
    console.error("❌ خطأ في تحديث الملف:", error.message);
    res.status(500).json({ success: false, message: "❌ خطأ داخلي في السيرفر" });
  }
}
