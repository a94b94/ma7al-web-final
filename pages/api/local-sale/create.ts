import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import LocalInvoice from "@/models/LocalInvoice";
import Order from "@/models/Order";

interface Installment {
  date: Date;
  amount: number;
  paid: boolean;
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().split("T")[0].replace(/-/g, "");
  const randomPart = Math.floor(100 + Math.random() * 900); // 3 أرقام عشوائية
  return `INV-${datePart}-${randomPart}`;
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
      notes = "",
    } = req.body;

    const invoiceDate = createdAt ? new Date(createdAt) : new Date();
    const address = customerName;

    if (
      !phone ||
      typeof phone !== "string" ||
      !customerName ||
      !Array.isArray(cart) ||
      cart.length === 0 ||
      typeof total !== "number" ||
      !type
    ) {
      return res.status(400).json({ success: false, error: "❗ البيانات ناقصة أو غير صحيحة" });
    }

    const invoiceNumber = generateInvoiceNumber();

    // ✅ إنشاء الفاتورة المحلية
    const invoice = await LocalInvoice.create({
      phone,
      address,
      cart,
      total,
      createdAt: invoiceDate,
      type,
      downPayment,
      installmentsCount,
      dueDate: invoiceDate.toISOString(),
      remaining,
      paid,
      discount,
      storeId,
      storeName,
      customerName,
      sentBy,
      invoiceNumber,
      notes,
    });

    // ✅ إنشاء أقساط إذا كانت تقسيط
    if (type === "installment" && installmentsCount > 0) {
      const installments: Installment[] = [];
      const amountToDivide = total - downPayment - discount;
      const installmentAmount = Math.ceil(amountToDivide / installmentsCount);
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
        dueDate: installments[0]?.date.toISOString(),
        remaining,
        paid,
        discount,
        storeId,
        storeName,
        customerName,
        customerPhone: phone,
        sentBy,
        installments,
        invoiceNumber,
        notes,
      });
    }

    return res.status(201).json({ success: true, invoice });
  } catch (error: any) {
    console.error("❌ خطأ أثناء حفظ الفاتورة:", error.message);
    return res.status(500).json({ success: false, error: "حدث خطأ داخلي أثناء حفظ البيانات" });
  }
}
