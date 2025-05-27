import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مدعومة" });
  }

  try {
    await connectToDatabase();

    const products = await Product.find({})
      .sort({ createdAt: -1 }) // ✅ ترتيب حسب الأحدث
      .lean(); // ✅ لتحسين الأداء

    return res.status(200).json(products);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات:", error.message || error);
    return res.status(500).json({ error: "⚠️ حدث خطأ أثناء جلب المنتجات" });
  }
}
