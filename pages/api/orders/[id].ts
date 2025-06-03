// pages/api/orders/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import Order from "@/models/Order";  // تأكد من صحة المسار
import { connectDB } from "@/lib/mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "الطريقة غير مدعومة" });
  }

  if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "معرف الطلب غير صالح" });
  }

  try {
    await connectDB();

    const order = await Order.findById(id).lean();

    if (!order) {
      return res.status(404).json({ error: "لم يتم العثور على الطلب" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("خطأ أثناء جلب الطلب:", error);
    return res.status(500).json({ error: "خطأ في الخادم الداخلي" });
  }
}
