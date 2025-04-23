import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, category } = req.query;

  if (!id) {
    return res.status(400).json({ error: "❗ لم يتم توفير معرف المتجر" });
  }

  await connectToDatabase();

  // ✅ إذا تم تمرير category، نفلتر حسبها
  const filter: any = { storeId: id };
  if (category) {
    filter.category = category;
  }

  try {
    const products = await Product.find(filter);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "فشل في جلب المنتجات" });
  }
}
