import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    await dbConnect();

    const productsCount = await Product.countDocuments();
    res.status(200).json({ productsCount });
  } catch (error: any) {
    console.error("⛔ Error counting products:", error.message);
    res.status(500).json({ error: "⚠️ حدث خطأ أثناء جلب عدد المنتجات" });
  }
}
