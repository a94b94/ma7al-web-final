// pages/api/products/similar.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ الطريقة غير مدعومة" });
  }

  const { category, excludeId } = req.query;

  if (!category || typeof category !== "string") {
    return res.status(400).json({ error: "❗يجب تحديد القسم" });
  }

  try {
    await dbConnect();

    const products = await Product.find({
      category,
      isPublished: true,
      _id: { $ne: excludeId },
    })
      .populate("storeId", "name")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const cleaned = products.map((p: any) => {
      const store =
        typeof p.storeId === "object" && "name" in p.storeId
          ? {
              _id: p.storeId._id?.toString?.() || undefined,
              name: p.storeId.name || "",
            }
          : null;

      return {
        ...p,
        _id: p._id.toString(),
        storeId: store,
      };
    });

    return res.status(200).json(cleaned);
  } catch (error: any) {
    console.error("❌ خطأ أثناء جلب المنتجات المشابهة:", error.message || error);
    return res.status(500).json({ error: "⚠️ فشل في جلب المنتجات المشابهة" });
  }
}
