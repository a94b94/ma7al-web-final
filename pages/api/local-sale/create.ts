import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";
import Order from "@/models/Order";

interface Installment {
  date: Date;
  amount: number;
  paid: boolean;
}

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
      remaining = 0,
      paid = 0,
      discount = 0,
      storeId = "default",
      storeName = "Store",
      sentBy = "مشرف",
    } = req.body;

    const address = customerName;
    const invoiceDate = createdAt ? new Date(createdAt) : new Date();

    if (!phone || !customerName || !Array.isArray(cart) || cart.length === 0 || !total || !type) {
      return res.status(400).json({ success: false, error: "❗ البيانات ناقصة أو غير صحيحة" });
    }

    // ✅ إنشاء الفاتورة
    const invoice = await LocalInvoice.create({
      phone,
      address,
      cart,
      total,
      createdAt: invoiceDate,
      type,
      downPayment,
      installmentsCount,
      dueDate: invoiceDate.toISOString(), // التاريخ الأول (مبدئي)
      remaining,
      paid,
      discount,
      storeId,
      storeName,
      customerName,
      sentBy,
    });

    // ✅ إنشاء أقساط إذا كان نوع الفاتورة "تقسيط"
    if (type === "installment" && installmentsCount > 0) {
      const installments: Installment[] = [];

      const installmentAmount = Math.ceil((total - downPayment) / installmentsCount);
      const baseDate = new Date(invoiceDate);

      for (let i = 1; i <= installmentsCount; i++) {
        const dueDate = new Date(baseDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        installments.push({
          date: dueDate,
          amount: installmentAmount,
          paid: false,
        });
      }

      await Order.create({
        phone,
        address,
        cart,
        total,
        type,
        downPayment,
        installmentsCount,
        dueDate: installments[0].date.toISOString(), // أول تاريخ استحقاق
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
    }

    return res.status(201).json({ success: true, invoice });
  } catch (error: any) {
    console.error("❌ خطأ أثناء حفظ الفاتورة:", error.message);
    return res.status(500).json({ success: false, error: "حدث خطأ داخلي أثناء حفظ البيانات" });
  }
}
