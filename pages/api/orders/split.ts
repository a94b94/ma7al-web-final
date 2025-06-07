// pages/api/orders/split.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order, { IOrder } from "@/models/Order"; // ✅ تأكد من تصدير IOrder من الموديل
import { HydratedDocument } from "mongoose";

interface CartItem {
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  storeId: string;
  storeName?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { phone, address, cart, paymentMethod } = req.body;

  if (!phone || !address || !cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: "❗ بيانات غير مكتملة" });
  }

  await connectDB();

  const ordersByStore: Record<string, CartItem[]> = {};

  for (const item of cart) {
    if (!item.storeId || !item.name || !item.price || !item.quantity) continue;

    if (!ordersByStore[item.storeId]) {
      ordersByStore[item.storeId] = [];
    }

    ordersByStore[item.storeId].push(item);
  }

  const createdOrders: HydratedDocument<IOrder>[] = [];

  for (const storeId in ordersByStore) {
    const storeCart = ordersByStore[storeId];
    const total = storeCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const storeName = storeCart[0]?.storeName || "متجر غير معروف";

    const newOrder = await Order.create({
      phone,
      address,
      cart: storeCart,
      total,
      storeId,
      storeName,
      type: paymentMethod === "cash" ? "cash" : "installment",
    });

    createdOrders.push(newOrder);
  }

  return res.status(201).json({
    success: true,
    message: `✅ تم إنشاء ${createdOrders.length} طلب حسب المتجر.`,
    orders: createdOrders,
  });
}
