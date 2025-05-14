// pages/api/recommendations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose"; // ✅ تعديل هنا
import Activity from "@/models/Activity";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId مطلوب" });
  }

  const recent = await Activity.find({ userId, action: "viewed" })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const viewedProductIds = recent.map((r) => r.productId);
  const lastCategory = recent[0]?.category;

  const recommendations = await Product.find({
    category: lastCategory,
    _id: { $nin: viewedProductIds },
  })
    .limit(6)
    .lean();

  res.status(200).json({ recommended: recommendations });
}
