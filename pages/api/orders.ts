import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import NotificationModel from "@/models/Notification";
import { verifyToken } from "@/middleware/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectToDatabase();

    const { cart, phone, address, total, dueDate, storeId } = req.body;

    if (!cart || !phone || !address || !total || !storeId) {
      return res.status(400).json({ error: "❗ جميع الحقول مطلوبة" });
    }

    let email = "";
    let userName = "زائر";
    try {
      const user = verifyToken(req);
      email = user?.email || "";
      userName = user?.name || "مستخدم";
    } catch {
      email = "";
    }

    const order = await Order.create({
      cart,
      phone,
      address,
      total,
      dueDate,
      email,
      storeId,
      seen: false,
      status: "بانتظار التأكيد",
    });

    await NotificationModel.create({
      userId: phone,
      orderId: order._id,
      message: `📦 تم تسجيل طلب جديد بقيمة ${total.toLocaleString()} د.ع`,
      type: "order",
      sentBy: userName,
    });

    return res.status(201).json({ success: true, order });
  } catch (err: any) {
    console.error("⛔ خطأ أثناء حفظ الطلب:", err.message);
    return res.status(500).json({ error: "حدث خطأ أثناء الحفظ" });
  }
}
