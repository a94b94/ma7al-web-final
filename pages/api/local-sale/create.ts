import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";
import Order from "@/models/Order";

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
      downPayment = 0,
      installmentsCount = 0,
      dueDate,
      remaining = 0,
      paid = 0,
      discount = 0,
      storeId = "default",
      storeName = "Store",
      customerName = "الزبون",
      sentBy = "مشرف",
    } = req.body;

    if (!phone || !address || !Array.isArray(cart) || cart.length === 0 || !total || !type) {
      return res.status(400).json({ success: false, error: "❗ البيانات ناقصة أو غير صحيحة" });
    }

    console.log("📦 حفظ فاتورة محلية...");
    console.log({ phone, customerName, total, type });

    // حفظ الفاتورة في LocalInvoice
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
      sentBy,
    });

    // إذا كانت تقسيط، نحفظ نسخة في Order (لمتابعة الأقساط لاحقًا)
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
        storeId,
        storeName,
        customerName,
        customerPhone: phone,
        sentBy,
      });

      console.log("🗂️ تم إنشاء سجل متابعة للأقساط");
    }

    return res.status(201).json({ success: true, invoice });
  } catch (error: any) {
    console.error("❌ خطأ أثناء حفظ الفاتورة:", error.message);
    return res.status(500).json({ success: false, error: "حدث خطأ داخلي أثناء حفظ البيانات" });
  }
}
