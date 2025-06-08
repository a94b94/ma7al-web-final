// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Product from "@/models/Product";
import redis from "@/lib/redis"; // تأكد من وجود redis client مهيأ مسبقًا

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  await connectDB();

  const { q } = req.query;

  if (!q || typeof q !== "string" || q.trim().length < 2) {
    return res.status(400).json({ error: "يرجى إدخال كلمة بحث صالحة (حرفين على الأقل)" });
  }

  const trimmedQuery = q.trim();
  const cacheKey = `search:${trimmedQuery}`;

  try {
    // تحقق من الكاش أولاً
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const regex = new RegExp(trimmedQuery, "i");

    const products = await Product.find(
      {
        isPublished: true,
        $or: [
          { name: regex },
          { category: regex },
          { barcode: regex },
        ],
      },
      "name price image category storeId"
    )
      .limit(12)
      .populate("storeId", "name")
      .lean();

    const result = { products };

    // خزّن النتيجة في Redis لمدة 10 دقائق
    await redis.set(cacheKey, JSON.stringify(result), "EX", 600);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Search Error:", error.message);
    return res.status(500).json({ error: "حدث خطأ أثناء البحث" });
  }
}
