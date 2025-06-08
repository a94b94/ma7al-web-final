// pages/api/orders/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import { generateInstallments } from "@/lib/generateInstallments";

type Installment = {
  date: Date;
  amount: number;
  paid: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    await connectToDatabase();

    const {
      phone,
      address,
      cart,
      total,
      type,
      downPayment = 0,
      installmentsCount = 0,
      dueDate,
      storeId,
      storeName,
    } = req.body;

    if (
      !phone || !address || !cart || !Array.isArray(cart) || cart.length === 0 ||
      !total || !type || !storeId || !storeName
    ) {
      return res.status(400).json({ error: "❗جميع الحقول مطلوبة ويجب أن تحتوي السلة على منتج واحد على الأقل" });
    }

    if (!["cash", "installment"].includes(type)) {
      return res.status(400).json({ error: "❗نوع الطلب غير صالح (cash أو installment فقط)" });
    }

    let installments: Installment[] = [];
    let remaining = total;

    if (type === "installment") {
      if (!dueDate || !installmentsCount || installmentsCount <= 0) {
        return res.status(400).json({ error: "❗يجب تحديد تاريخ أول قسط وعدد الأقساط" });
      }

      if (downPayment < 0 || downPayment >= total) {
        return res.status(400).json({ error: "❗دفعة أولى غير منطقية" });
      }

      remaining = total - downPayment;
      installments = generateInstallments(total, downPayment, installmentsCount, new Date(dueDate));
    }

    // ✅ تقليل الكمية من المخزون
    for (const item of cart) {
      const product = await Product.findById(item.productId);

      if (!product || typeof product.stock !== "number") {
        return res.status(400).json({ error: `🚫 المنتج غير موجود أو لا يحتوي على حقل مخزون صالح: ${item.name}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `❗الكمية غير كافية للمنتج: ${product.name}` });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // ✅ إنشاء الطلب
    const newOrder = await Order.create({
      phone,
      address,
      cart,
      total,
      type,
      downPayment,
      installmentsCount,
      dueDate,
      remaining,
      installments,
      storeId,
      storeName,
      createdAt: new Date(),
    });

    // ✅ إنشاء إشعار داخلي
    await Notification.create({
      title: "📦 تم إنشاء طلب جديد",
      body: `الزبون: ${phone} - الإجمالي: ${total} د.ع`,
      storeId,
      type: "order",
      createdAt: new Date(),
    });

    return res.status(201).json({ message: "✅ تم إنشاء الطلب بنجاح", order: newOrder });
  } catch (err: any) {
    console.error("⛔ خطأ أثناء إنشاء الطلب:", err.message);
    return res.status(500).json({ error: "⛔ فشل في إنشاء الطلب", details: err.message });
  }
}
