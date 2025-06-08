// ✅ ملف: /pages/api/customers/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Customer from "@/models/Customer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method not allowed" });
  }

  await connectDB();

  const { name, phone, address, paymentStatus } = req.body;

  if (
    !name?.trim() ||
    !phone?.trim() ||
    !address?.trim() ||
    !paymentStatus?.trim()
  ) {
    return res.status(400).json({ error: "❗ جميع الحقول مطلوبة" });
  }

  const phoneRegex = /^\d{9,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: "📱 رقم الهاتف غير صالح" });
  }

  try {
    const exists = await Customer.findOne({ phone: phone.trim() });
    if (exists) {
      return res.status(409).json({ error: "📛 الزبون موجود مسبقاً برقم الهاتف" });
    }

    const customer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentStatus: paymentStatus.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "✅ تم إنشاء الزبون بنجاح",
      customer,
    });
  } catch (err: any) {
    console.error("❌ فشل في إنشاء الزبون:", err.message);
    return res.status(500).json({
      error: "⚠️ حدث خطأ أثناء إنشاء الزبون",
      message: err.message,
    });
  }
}
