import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "❌ الطريقة غير مسموحة" });
  }

  try {
    await dbConnect();

    const featuredProducts = await Product.find({ isFeatured: true }) // تأكد من اسم الحقل الصحيح
      .sort({ createdAt: -1 })
      .limit(12) // اختياري: لتحديد عدد المنتجات
      .lean();

    return res.status(200).json(featuredProducts);
  } catch (error: any) {
    console.error("❌ فشل في جلب المنتجات المميزة:", error.message || error);
    return res.status(500).json({ message: "⚠️ حدث خطأ أثناء الجلب" });
  }
}
