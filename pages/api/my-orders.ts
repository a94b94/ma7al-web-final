// pages/api/my-orders.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyToken } from "@/lib/auth"; // تأكد أن المسار صحيح

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    await connectToDatabase();

    const user = verifyToken(req);
    if (!user || !user.id) {
      return res.status(401).json({ error: "🔒 غير مصرح" });
    }

    // ✅ جلب الطلبات بناءً على userId أو phone حسب النظام الخاص بك
    const orders = await Order.find({ userId: user.id }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, orders });
  } catch (err: any) {
    console.error("⛔ خطأ أثناء جلب الطلبات:", err.message);
    return res.status(500).json({ error: "🚨 فشل في جلب الطلبات" });
  }
}
