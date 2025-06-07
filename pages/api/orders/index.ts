// pages/api/orders/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const { phone, address, cart, total, storeId, paymentMethod } = req.body;

    if (!phone || !address || !cart || cart.length === 0 || !storeId || !paymentMethod) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    const newOrder = await Order.create({
      phone,
      address,
      cart,
      total,
      storeId,
      paymentMethod,
      status: "جديد",
    });

    return res.status(200).json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ error: "فشل في إنشاء الطلب" });
  }
}
