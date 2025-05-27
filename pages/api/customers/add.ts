// /pages/api/customers/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Customer from "@/models/Customer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method not allowed" });
  }

  const { name, phone, address, paymentStatus } = req.body;

  if (!name || !phone || !address || !paymentStatus) {
    return res.status(400).json({ error: "❗ جميع الحقول مطلوبة" });
  }

  try {
    await connectDB();

    const exists = await Customer.findOne({ phone });
    if (exists) {
      return res.status(409).json({ error: "📛 الزبون موجود مسبقاً برقم الهاتف" });
    }

    const customer = await Customer.create({
      name,
      phone,
      address,
      paymentStatus,
    });

    return res.status(201).json({ success: true, customer });
  } catch (err) {
    console.error("❌ فشل في إنشاء الزبون:", err);
    return res.status(500).json({ error: "حدث خطأ أثناء إنشاء الزبون" });
  }
}
