// pages/api/purchase.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import InventoryProduct, { InventoryProductType } from "@/models/InventoryProduct";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { supplierName, invoiceNumber, products } = req.body;

  if (!supplierName || !invoiceNumber || !Array.isArray(products)) {
    return res.status(400).json({ error: "البيانات غير مكتملة" });
  }

  try {
    await connectDB();

    // تأكد من صحة هيكل كل منتج باستخدام نوع TypeScript
    const productDocs: Partial<InventoryProductType>[] = products.map((item: any) => ({
      name: item.name,
      barcode: item.barcode,
      category: item.category,
      purchasePrice: item.purchasePrice,
      quantity: item.quantity,
      isPublished: false,
      createdAt: new Date(),
    }));

    const insertedProducts = await InventoryProduct.insertMany(productDocs);

    // ثم نحفظ الفاتورة ونربطها بالمنتجات
    const invoice = new PurchaseInvoice({
      supplierName,
      invoiceNumber,
      date: new Date(),
      products: insertedProducts.map((p) => p._id),
      createdAt: new Date(),
    });

    await invoice.save();

    res.status(200).json({ success: true, invoiceId: invoice._id });
  } catch (err) {
    console.error("❌ Error saving purchase:", err);
    res.status(500).json({ error: "فشل في حفظ الفاتورة" });
  }
}
