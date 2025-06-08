// pages/api/purchase/ocr.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // دعم ملفات PDF كبيرة
    },
  },
};

// 🧠 تخمين القسم تلقائيًا حسب الاسم
function detectCategory(name: string) {
  const lowered = name.toLowerCase();
  if (lowered.includes("laptop") || lowered.includes("لابتوب")) return "لابتوبات";
  if (lowered.includes("mobile") || lowered.includes("موبايل") || lowered.includes("هاتف")) return "موبايلات";
  if (lowered.includes("headphone") || lowered.includes("سماعة")) return "سماعات";
  if (lowered.includes("watch") || lowered.includes("ساعة")) return "ساعات";
  if (lowered.includes("tv") || lowered.includes("شاشة")) return "شاشات";
  return "غير مصنّف";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { products, pdfText } = req.body;

  try {
    await connectDB();

    let items = products;

    // ✅ استخراج من نص PDF إذا لم يتم تمرير المنتجات مباشرة
    if (!items?.length && pdfText) {
      const lines = pdfText.split("\n");
      items = [];
      for (const line of lines) {
        const match = line.match(/(.*)\s+(\d+[.,]?\d*)\s+(\d+)/);
        if (match) {
          const name = match[1].trim();
          items.push({
            name,
            purchasePrice: parseFloat(match[2].replace(",", "")),
            quantity: parseInt(match[3]),
            category: detectCategory(name),
          });
        }
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "لم يتم العثور على منتجات صالحة" });
    }

    const inserted: any[] = [];
    const skipped: any[] = [];

    for (const item of items) {
      const name = item.name?.trim();
      const barcode = item.barcode?.trim();
      const category = item.category || detectCategory(name);
      const exists = await InventoryProduct.findOne({
        $or: [{ name }, ...(barcode ? [{ barcode }] : [])],
      });

      if (exists) {
        skipped.push({ name, reason: "موجود مسبقًا" });
        continue;
      }

      const newProduct = await InventoryProduct.create({
        name,
        barcode,
        category,
        purchasePrice: item.purchasePrice || 0,
        quantity: item.quantity || 1,
        isPublished: false,
        createdAt: new Date(),
      });

      inserted.push(newProduct);
    }

    res.status(200).json({
      success: true,
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      inserted,
      skipped,
    });
  } catch (err) {
    console.error("❌ فشل في حفظ المنتجات:", err);
    res.status(500).json({ error: "فشل في حفظ البيانات" });
  }
}
