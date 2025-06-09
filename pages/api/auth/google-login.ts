import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import admin from "@/lib/firebase-admin";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Store from "@/models/Store";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("❌ يرجى تحديد JWT_SECRET في ملف .env.local");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "يرجى توفير ID Token" });
  }

  try {
    await connectToDatabase();

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: "حساب Google لا يحتوي على بريد إلكتروني" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        name: name?.trim() || "مستخدم جديد",
        uid,
        image: picture || "",
        role: "manager",
      });

      const store = await Store.create({
        name: `${name?.split(" ")[0] || "متجر"}-${Date.now()}`,
        logo: "",
        ownerId: user._id,
        phone: "",
        location: "",
      });

      user.storeName = store.name;
      user.storeLogo = store.logo;
      user.address = store.location;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        storeLogo: user.storeLogo,
        phone: user.phone,
        address: user.address,
        image: user.image,
        uid: user.uid,
      },
    });
  } catch (err: any) {
    console.error("❌ خطأ في تحقق Firebase:", err);
    return res.status(401).json({ error: "رمز التحقق غير صالح أو منتهي" });
  }
}
