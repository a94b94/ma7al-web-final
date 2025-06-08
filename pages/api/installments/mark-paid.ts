import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Order from "@/models/Order";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "معرّف الطلب غير صالح أو مفقود" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "لم يتم العثور على الطلب" });
    }

    if (order.status === "مكتمل") {
      return res.status(400).json({ message: "تم دفع الطلب مسبقًا بالفعل" });
    }

    const newPaid = order.total;
    const newRemaining = 0;

    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        paid: newPaid,
        remaining: newRemaining,
        status: "مكتمل",
        finalPaidAt: new Date(), // ملاحظة: أضف هذا الحقل إلى الـ schema إذا غير موجود
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      updatedOrder: {
        _id: updated?._id,
        customerName: updated?.customerName,
        phone: updated?.phone,
        paid: updated?.paid,
        remaining: updated?.remaining,
        status: updated?.status,
      },
    });
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث حالة الدفع:", err);
    return res.status(500).json({ success: false, message: "فشل في التحديث" });
  }
}
