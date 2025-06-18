// ✅ API: /api/purchase/import.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";
import PurchaseInvoice from "@/models/PurchaseInvoice"; // تأكد أن عندك هذا الموديل

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  await connectDB();

  const { invoiceNumber, supplierName, products } = req.body;

  if (!invoiceNumber || !supplierName || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "البيانات غير مكتملة" });
  }

  try {
    // ✅ 1. إضافة كل المنتجات دفعة واحدة
    const inserted = await InventoryProduct.insertMany(products);

    // ✅ 2. إنشاء الفاتورة وربطها بالمنتجات
    const invoice = await PurchaseInvoice.create({
      invoiceNumber,
      supplierName,
      products: inserted.map((p) => p._id),
    });

    return res.status(200).json({ success: true, invoiceId: invoice._id });
  } catch (error) {
    console.error("❌ import error:", error);
    return res.status(500).json({ message: "فشل في الحفظ" });
  }
}
