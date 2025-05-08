import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    await dbConnect();

    const {
      phone,
      address,
      cart,
      total,
      createdAt,
      type,
      downPayment,
      installmentsCount,
      dueDate,
      remaining,
    } = req.body;

    // ✅ التحقق من الحقول المطلوبة
    if (!phone || !address || !cart || !Array.isArray(cart) || !total || !type) {
      return res.status(400).json({ success: false, error: "❗ بيانات ناقصة" });
    }

    // ✅ طباعة البيانات في اللوغ لمراجعتها
    console.log("📦 البيانات المستلمة:", req.body);

    // ✅ حفظ الفاتورة
    const invoice = await LocalInvoice.create({
      phone,
      address,
      cart,
      total,
      createdAt,
      type,
      downPayment,
      installmentsCount,
      dueDate,
      remaining,
    });

    return res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error("❌ خطأ أثناء الحفظ:", error);
    return res.status(500).json({ success: false, error: "فشل في حفظ الفاتورة" });
  }
}
