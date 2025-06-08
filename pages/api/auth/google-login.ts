// /pages/api/auth/google-login.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { connectDB } from "@/lib/mongoose"; // ✅ تصحيح الاستيراد
import User from "@/models/User";
import jwt from "jsonwebtoken";
import serviceAccount from "@/config/firebase-key.json"; // 🔐 المفتاح السري

const JWT_SECRET = process.env.JWT_SECRET!;

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "🚫 Method Not Allowed" });
  }

  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "⚠️ لم يتم توفير التوكن" });
  }

  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decoded;

    if (!email) {
      return res.status(400).json({ error: "❌ لا يوجد بريد في حساب Google" });
    }

    await connectDB();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        password: uid, // 🔒 لا يُستخدم فعليًا (لتجاوز التحقق من الحقل)
        storeName: `متجر-${Date.now()}`, // 🏪 اسم متجر تلقائي
        image: picture || "",
        location: "غير محدد",
        role: "manager",
      });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image || "/images/user.png",
        storeName: user.storeName,
        storeLogo: user.storeLogo || "",
        storeStamp: user.storeStamp || "",
        location: user.location,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("❌ Google Login Error:", error.message);
    return res.status(500).json({
      error: "❌ فشل التحقق من Google",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
