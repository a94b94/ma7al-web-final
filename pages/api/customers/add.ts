
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, phone, address, paymentStatus } = req.body;

  if (!name || !phone || !address || !paymentStatus) {
    return res.status(400).json({ error: "❌ جميع الحقول مطلوبة" });
  }

  try {
    await connectToDatabase();

    const existing = await Customer.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: "📛 الزبون موجود مسبقاً برقم الهاتف" });
    }

    const newCustomer = await Customer.create({
      name,
      phone,
      address,
      paymentStatus,
    });

    res.status(200).json({ success: true, customer: newCustomer });
  } catch (err) {
    console.error("❌ Error adding customer:", err);
    res.status(500).json({ error: "فشل في إنشاء الزبون" });
  }
}
