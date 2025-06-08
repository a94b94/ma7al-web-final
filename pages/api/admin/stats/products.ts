// pages/api/products/count.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  try {
    await dbConnect();

    const productsCount = await Product.countDocuments();

    return res.status(200).json({
      success: true,
      count: productsCount,
      message: "✅ تم جلب عدد المنتجات بنجاح",
    });
  } catch (error: any) {
    console.error("⛔ Error counting products:", error.message);
    return res.status(500).json({
      success: false,
      error: "⚠️ حدث خطأ أثناء جلب عدد المنتجات",
    });
  }
}
