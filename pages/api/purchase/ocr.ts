// pages/api/purchase/ocr.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";

// ✅ إزالة pdf-parse لأنه غير مستخدم فعليًا هنا وتم حله عبر النصوص الممررة

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // دعم ملفات PDF بحجم كبير
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { products, pdfText } = req.body;

  try {
    await connectDB();

    let items = products;

    if (!items?.length && pdfText) {
      const lines = pdfText.split("\n");
      items = [];
      for (const line of lines) {
        const match = line.match(/(.*)\s+(\d+[.,]?\d*)\s+(\d+)/); // اسم، سعر، كمية
        if (match) {
          items.push({
            name: match[1].trim(),
            purchasePrice: parseFloat(match[2].replace(",", "")),
            quantity: parseInt(match[3]),
            category: "غير مصنّف",
          });
        }
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "لم يتم العثور على منتجات صالحة" });
    }

    const formatted = items.map((item: any) => ({
      name: item.name,
      barcode: item.barcode || "",
      category: item.category || "غير مصنّف",
      purchasePrice: item.purchasePrice || 0,
      quantity: item.quantity || 1,
      isPublished: false,
      createdAt: new Date(),
    }));

    const inserted = await InventoryProduct.insertMany(formatted);

    res.status(200).json({ success: true, inserted });
  } catch (err) {
    console.error("❌ فشل في حفظ المنتجات:", err);
    res.status(500).json({ error: "فشل في حفظ البيانات" });
  }
}
