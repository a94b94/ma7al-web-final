import { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Store from "@/models/Store";

const JWT_SECRET = process.env.JWT_SECRET!;
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY || "{}");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "ID Token is required" });

  try {
    await connectToDatabase();

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: "Missing email in Firebase token" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 🔍 البحث عن المستخدم
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // ✅ إنشاء المستخدم الجديد
      user = await User.create({
        email: normalizedEmail,
        name,
        uid,
        image: picture,
        role: "manager", // أو "owner" حسب النظام
      });

      // ✅ إنشاء متجر افتراضي بناءً على الاسم
      const store = await Store.create({
        name: `${name?.split(" ")[0] || "متجر"}-${Date.now()}`,
        logo: "",
        ownerId: user._id,
        phone: "",
        location: "",
      });

      // ✅ ربط المتجر بالمستخدم
      user.storeName = store.name;
      user.storeLogo = store.logo;
      user.address = store.location;
      await user.save();
    }

    // ✅ إصدار توكن JWT
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
  } catch (error: any) {
    console.error("❌ Firebase verify error:", error);
    return res.status(401).json({ error: "Invalid ID token" });
  }
}
