import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import { generateInstallments } from "@/lib/generateInstallments";

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
      storeName, // ✅ جديد
    } = req.body;

    if (!phone || !address || !cart || !total || !type || !storeId || !storeName) {
      return res.status(400).json({ error: "❗جميع الحقول مطلوبة بما في ذلك المتجر" });
    }

    let installments = [];
    let remaining = total;

    if (type === "installment") {
      if (!dueDate || !installmentsCount) {
        return res.status(400).json({ error: "❗يجب تحديد تاريخ أول قسط وعدد الأقساط" });
      }

      remaining = total - downPayment;
      installments = generateInstallments(total, downPayment, installmentsCount, new Date(dueDate));
    }

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
      storeId,     // ✅ مضاف
      storeName,   // ✅ مضاف
    });

    return res.status(201).json({ message: "✅ تم إنشاء الطلب بنجاح", order: newOrder });
  } catch (err: any) {
    console.error("⛔ خطأ أثناء إنشاء الطلب:", err.message);
    return res.status(500).json({ error: "فشل في إنشاء الطلب" });
  }
}
