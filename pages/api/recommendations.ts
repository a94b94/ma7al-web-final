import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Activity from "@/models/Activity";
import Product from "@/models/Product";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!); // تأكد من ضبط متغير البيئة

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();

    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId مطلوب" });
    }

    // ✅ فحص الكاش من Redis
    const cached = await redis.get(`recommendations:${userId}`);
    if (cached) {
      return res.status(200).json({ fromCache: true, recommended: JSON.parse(cached) });
    }

    // ⬇️ جلب آخر المنتجات المشاهدة
    const recent = await Activity.find({ userId, action: "viewed" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const viewedProductIds = recent.map((r) => r.productId);
    const lastCategory = recent[0]?.category;

    const recommendations = await Product.find({
      category: lastCategory,
      _id: { $nin: viewedProductIds },
      isPublished: true,
    })
      .populate("storeId", "name")
      .limit(6)
      .lean();

    // ✅ تخزين النتيجة في Redis لمدة ساعة
    await redis.setex(
      `recommendations:${userId}`,
      60 * 60, // 1 ساعة
      JSON.stringify(recommendations)
    );

    return res.status(200).json({ fromCache: false, recommended: recommendations });
  } catch (error: any) {
    console.error("❌ فشل في جلب المقترحات:", error.message || error);
    return res.status(500).json({ error: "⚠️ حدث خطأ أثناء جلب المقترحات" });
  }
}
