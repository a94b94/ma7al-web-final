import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";
import Order from "@/models/Order"; // ✅ إضافة نموذج الطلبات

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
      paid,
      discount,
      storeId,
      storeName,
      customerName,
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!phone || !address || !cart || !Array.isArray(cart) || !total || !type) {
      return res.status(400).json({ success: false, error: "❗ بيانات ناقصة" });
    }

    console.log("📦 البيانات المستلمة:", req.body);

    // ✅ حفظ الفاتورة في localinvoices
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
      paid,
      discount,
      storeId,
      storeName,
      customerName,
    });

    // ✅ إذا كانت تقسيط، نحفظ نسخة في orders لعرضها في قائمة الأقساط
    if (type === "installment") {
      await Order.create({
        phone,
        address,
        cart,
        total,
        type,
        downPayment,
        installmentsCount,
        dueDate,
        remaining,
        paid,
        discount,
        storeId: storeId || "default",
        storeName: storeName || "Store",
        customerName: customerName || "الزبون",
      });
    }

    return res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error("❌ خطأ أثناء الحفظ:", error);
    return res.status(500).json({ success: false, error: "فشل في حفظ الفاتورة" });
  }
}
