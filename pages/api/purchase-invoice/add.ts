// ✅ /api/purchase-invoice/add.ts

import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import PurchaseInvoice from "@/models/PurchaseInvoice";
import InventoryProduct from "@/models/InventoryProduct";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();

  const { invoiceNumber, supplierName, products } = req.body;

  if (!invoiceNumber || !supplierName || !Array.isArray(products)) {
    return res.status(400).json({ error: "بيانات غير مكتملة" });
  }

  try {
    // 🛒 حفظ المنتجات داخل InventoryProduct
    const savedProducts = await Promise.all(
      products.map(async (product: any) => {
        const newProduct = await InventoryProduct.create({
          ...product,
          createdAt: new Date(),
        });
        return newProduct._id;
      })
    );

    // 🧾 إنشاء الفاتورة وربط المنتجات
    const invoice = await PurchaseInvoice.create({
      invoiceNumber,
      supplierName,
      date: new Date(),
      products: savedProducts,
    });

    res.status(200).json({ success: true, invoice });
  } catch (err: any) {
    console.error("❌ Error saving invoice:", err);
    res.status(500).json({ error: "فشل في حفظ الفاتورة" });
  }
}
