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
      customerName = "الزبون",
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
      sentBy = "مشرف",
    } = req.body;

    const address = customerName; // استخدام اسم الزبون كعنوان افتراضي (محلي)

    if (!phone || !customerName || !Array.isArray(cart) || cart.length === 0 || !total || !type) {
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

    // إذا كانت تقسيط، نحسب الأقساط ونحفظ نسخة في Order
    if (type === "installment") {
      const installments = [];

      if (installmentsCount > 0 && dueDate) {
        const installmentAmount = Math.ceil((total - downPayment) / installmentsCount);
        for (let i = 0; i < installmentsCount; i++) {
          const due = new Date(dueDate);
          due.setMonth(due.getMonth() + i);
          installments.push({
            date: due,
            amount: installmentAmount,
            paid: false,
          });
        }
      }

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
        installments,
      });

      console.log("🗂️ تم إنشاء سجل متابعة للأقساط مع جدول أقساط");
    }

    return res.status(201).json({ success: true, invoice });
  } catch (error: any) {
    console.error("❌ خطأ أثناء حفظ الفاتورة:", error.message);
    return res.status(500).json({ success: false, error: "حدث خطأ داخلي أثناء حفظ البيانات" });
  }
}
