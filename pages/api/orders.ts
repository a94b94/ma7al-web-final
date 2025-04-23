
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectToDatabase();

    const { cart, phone, address, total, dueDate } = req.body;

    if (!cart || !phone || !address || !total) {
      return res.status(400).json({ error: "❗ جميع الحقول مطلوبة" });
    }

    let email = "";
    try {
      const user = verifyToken(req);
      email = user?.email || "";
    } catch {
      // الزبون غير مسجل دخول؟ نكمل بدون بريد
      email = "";
    }

    const order = await Order.create({
      cart,
      phone,
      address,
      total,
      dueDate,
      email,
    });

    return res.status(201).json({ success: true, order });
  } catch (err: any) {
    console.error("⛔ خطأ أثناء حفظ الطلب:", err.message);
    return res.status(500).json({ error: "حدث خطأ أثناء الحفظ" });
  }
}
