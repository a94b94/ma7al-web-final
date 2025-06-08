// pages/api/orders/multi-store.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order, { IOrder } from "@/models/Order";
import NotificationModel from "@/models/Notification";
import { verifyToken } from "@/middleware/auth";
import type { HydratedDocument } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    await connectToDatabase();

    const { cart, phone, address, total, dueDate } = req.body;

    if (
      !Array.isArray(cart) || cart.length === 0 ||
      !phone || typeof phone !== "string" ||
      !address || typeof address !== "string" ||
      typeof total !== "number"
    ) {
      return res.status(400).json({ error: "❗ تأكد من جميع الحقول المطلوبة" });
    }

    // ✅ استخراج المستخدم من التوكن
    let email = "";
    let userName = "زائر";
    try {
      const user = verifyToken(req) as { email?: string; name?: string };
      email = user?.email || "";
      userName = user?.name || "مستخدم";
    } catch {
      // المستخدم غير مسجل الدخول
    }

    const groupedByStore: { [storeId: string]: typeof cart } = {};
    for (const item of cart) {
      if (!item.storeId || typeof item.storeId !== "string") {
        return res.status(400).json({ error: "❗ كل منتج يجب أن يحتوي على storeId صالح" });
      }
      groupedByStore[item.storeId] ??= [];
      groupedByStore[item.storeId].push(item);
    }

    const createdOrders: HydratedDocument<IOrder>[] = [];

    for (const storeId in groupedByStore) {
      const storeCart = groupedByStore[storeId];
      const storeTotal = storeCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const newOrder = await Order.create({
        cart: storeCart,
        phone,
        address,
        total: storeTotal,
        dueDate,
        email,
        storeId,
        seen: false,
        status: "بانتظار التأكيد",
        createdAt: new Date(),
      });

      await NotificationModel.create({
        userId: phone,
        orderId: newOrder._id,
        message: `📦 تم تسجيل طلب جديد بقيمة ${storeTotal.toLocaleString()} د.ع`,
        type: "order",
        sentBy: userName,
        createdAt: new Date(),
      });

      createdOrders.push(newOrder);
    }

    return res.status(201).json({ success: true, orders: createdOrders });
  } catch (err: any) {
    console.error("⛔ خطأ أثناء حفظ الطلبات:", err.message);
    return res.status(500).json({ error: "⚠️ حدث خطأ أثناء حفظ الطلبات" });
  }
}
