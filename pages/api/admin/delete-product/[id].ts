import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;

  // ✅ حماية: تحقق من التوكن
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ message: "🚫 غير مصرح" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "❌ فشل في حذف المنتج" });
  }
}
