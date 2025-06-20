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

  const { invoiceNumber, supplierName, products, date } = req.body;

  if (!invoiceNumber || !supplierName || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "📛 بيانات غير مكتملة أو المنتجات فارغة" });
  }

  try {
    // ✅ 1. حفظ المنتجات داخل InventoryProduct
    const savedProductIds = await Promise.all(
      products.map(async (product: any) => {
        const saved = await InventoryProduct.create({
          name: product.name,
          barcode: product.barcode || "",
          category: product.category || "غير مصنّف",
          purchasePrice: product.purchasePrice,
          quantity: product.quantity,
          isPublished: false,
        });
        return saved._id;
      })
    );

    // ✅ 2. حفظ الفاتورة وربط المنتجات
    const invoice = await PurchaseInvoice.create({
      invoiceNumber,
      supplierName,
      date: date ? new Date(date) : new Date(),
      products: savedProductIds,
    });

    res.status(200).json({ success: true, invoice });
  } catch (error: any) {
    console.error("❌ Error saving purchase invoice:", error);
    res.status(500).json({ error: "❌ فشل في حفظ الفاتورة" });
  }
}
