import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "الطريقة غير مدعومة" });
  }

  await dbConnect();

  try {
    const { name, price, category, image } = req.body;

    if (!name || !price || !category || !image) {
      return res.status(400).json({ success: false, message: "الرجاء ملء جميع الحقول" });
    }

    const newProduct = new Product({ name, price, category, image });
    await newProduct.save();

    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("خطأ أثناء حفظ المنتج:", error);
    res.status(500).json({ success: false, message: "فشل في حفظ المنتج" });
  }
}