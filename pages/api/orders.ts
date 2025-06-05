import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import NotificationModel from "@/models/Notification";
import { verifyToken } from "@/middleware/auth";
import type { HydratedDocument } from "mongoose";
import type { IOrder } from "@/models/Order"; // تأكد من وجود هذا النوع داخل موديل Order

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
      return res.status(400).json({ error: "❗ تأكد من جميع الحقول" });
    }

    // ✅ استخراج بيانات المستخدم من التوكن
    let email = "";
    let userName = "زائر";
    try {
      const user = verifyToken(req);
      email = user?.email || "";
      userName = user?.name || "مستخدم";
    } catch {
      // لا تفعل شيء، المستخدم زائر
    }

    // ✅ تجميع المنتجات حسب المتجر
    const groupedByStore: { [key: string]: typeof cart } = {};
    cart.forEach((item) => {
      if (!groupedByStore[item.storeId]) {
        groupedByStore[item.storeId] = [];
      }
      groupedByStore[item.storeId].push(item);
    });

    const createdOrders: HydratedDocument<IOrder>[] = [];

    for (const storeId in groupedByStore) {
      const storeCart = groupedByStore[storeId];
      const storeTotal = storeCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const order = await Order.create({
        cart: storeCart,
        phone,
        address,
        total: storeTotal,
        dueDate,
        email,
        storeId,
        seen: false,
        status: "بانتظار التأكيد",
      });

      await NotificationModel.create({
        userId: phone,
        orderId: order._id,
        message: `📦 تم تسجيل طلب جديد بقيمة ${storeTotal.toLocaleString()} د.ع`,
        type: "order",
        sentBy: userName,
      });

      createdOrders.push(order);
    }

    return res.status(201).json({ success: true, orders: createdOrders });
  } catch (err: any) {
    console.error("⛔ خطأ أثناء حفظ الطلبات:", err.message);
    return res.status(500).json({ error: "⚠️ حدث خطأ أثناء حفظ الطلبات" });
  }
}
