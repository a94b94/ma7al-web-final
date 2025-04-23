
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const user = verifyToken(req);
    if (!user || !user.email) {
      return res.status(401).json({ error: "غير مصرح" });
    }

    await connectToDatabase();

    // ✅ جلب الطلبات بناءً على البريد الإلكتروني للمستخدم
    const orders = await Order.find({ email: user.email }).sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (err: any) {
    console.error("⛔ خطأ:", err.message);
    return res.status(500).json({ error: "فشل في جلب الطلبات" });
  }
}
