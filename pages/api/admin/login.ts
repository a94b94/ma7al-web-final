// pages/api/auth/login.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '🚫 Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: '⚠️ البريد وكلمة المرور مطلوبة' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: '⚠️ البريد الإلكتروني غير صالح' });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: '❌ بيانات الدخول غير صحيحة' });
    }

    if (!user.password) {
      return res.status(401).json({ success: false, message: '⚠️ هذا الحساب تم إنشاؤه عبر Google ولا يمكن تسجيل الدخول بكلمة مرور' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '❌ بيانات الدخول غير صحيحة' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("⚠️ المتغير JWT_SECRET غير موجود في البيئة");
    }

    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: '✅ تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name || "",
        email: user.email,
        image: user.image || "/images/user.png",
        storeName: user.storeName || "",
        storeLogo: user.storeLogo || "",
        storeStamp: user.storeStamp || "",
        role: user.role || "manager",
        location: user.location || "",
      },
    });
  } catch (error: any) {
    console.error("❌ خطأ أثناء تسجيل الدخول:", error.message);
    return res.status(500).json({
      success: false,
      message: "❌ حدث خطأ داخلي أثناء تسجيل الدخول",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
