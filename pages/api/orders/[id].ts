// pages/api/orders/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Order from "@/models/Order";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "❌ الطريقة غير مدعومة" });
  }

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "❌ معرف الطلب غير صالح" });
  }

  try {
    await connectDB();

    // ✅ تحقق من التوكن
    let user: any;
    try {
      user = verifyToken(req);
    } catch {
      return res.status(401).json({ success: false, message: "🚫 توكن غير صالح أو مفقود" });
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "❌ لم يتم العثور على الطلب" });
    }

    // ✅ تحقق أن الطلب يخص نفس المتجر
    if (order.storeId.toString() !== user.storeId) {
      return res.status(403).json({ success: false, message: "🚫 لا تملك صلاحية الوصول لهذا الطلب" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب الطلب:", error.message);
    return res.status(500).json({ success: false, message: "⚠️ خطأ في الخادم", error: error.message });
  }
}
