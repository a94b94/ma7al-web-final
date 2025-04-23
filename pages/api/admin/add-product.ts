import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  const { name, price, category, image } = req.body;

  if (!name || !price || !category || !image) {
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });
  }

  try {
    const newProduct = await Product.create({
      name,
      price,
      category,
      image,
    });

    res.status(200).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("فشل حفظ المنتج:", error);
    res.status(500).json({ message: "فشل حفظ المنتج" });
  }
}
