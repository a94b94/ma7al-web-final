
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const user = verifyToken(req);
    if (!user || !user.email) {
      return res.status(401).json({ error: "غير مصرح" });
    }

    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "بيانات غير مكتملة" });
    }

    await connectToDatabase();

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }

    return res.status(200).json({ success: true, order });
  } catch (err: any) {
    console.error("⛔ فشل في التحديث:", err.message);
    return res.status(500).json({ error: "حدث خطأ داخلي" });
  }
}
