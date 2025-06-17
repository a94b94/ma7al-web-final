import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import InventoryProduct from "@/models/InventoryProduct";
import Tesseract from "tesseract.js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ message: "يرجى توفير رابط الصورة" });

  try {
    await connectDB();

    const result = await Tesseract.recognize(imageUrl, "eng", {
      logger: (m) => console.log("🔍 OCR progress:", m),
    });

    const text = result.data.text;
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // 🧠 استخراج المنتجات بناءً على التنسيق المتوقع
    const products = lines.map((line) => {
      const [name, quantityStr, priceStr] = line.split(/\s+/);
      return {
        name: name || "منتج غير معروف",
        quantity: parseInt(quantityStr) || 1,
        purchasePrice: parseFloat(priceStr) || 0,
        isPublished: false,
      };
    });

    await InventoryProduct.insertMany(products);

    return res.status(200).json({ message: "تمت الإضافة", count: products.length });
  } catch (err) {
    console.error("❌ خطأ في OCR:", err);
    return res.status(500).json({ message: "فشل في معالجة الصورة" });
  }
}
