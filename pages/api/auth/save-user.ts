// pages/api/auth/save-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { name, email, image, uid } = req.body;

  if (!email || !uid) {
    return res.status(400).json({ message: "Email and UID are required" });
  }

  try {
    await dbConnect();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        image,
        uid,
        role: "manager", // أو "customer" إذا تحب تخلي مستخدم عادي
      });
    }

    return res.status(200).json({ message: "User saved", user });
  } catch (error: any) {
    console.error("❌ Error saving user:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
