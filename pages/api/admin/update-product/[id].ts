import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/utils/dbConnect";
import Product from "@/models/Product";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "Abdullaha94b1994ASDF";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // ✅ تحقق من التوكن
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "🚫 غير مصرح. يجب تسجيل الدخول" });
  }

  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(403).json({ message: "❌ توكن غير صالح أو منتهي" });
  }

  const { id } = req.query;

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "❌ الطريقة غير مدعومة" });
  }

  const { name, price, category, image, featured } = req.body;

  if (!name || !price || !category || !image) {
    return res.status(400).json({ message: "⚠️ يرجى تعبئة جميع الحقول المطلوبة" });
  }

  try {
    const updated = await Product.findByIdAndUpdate(
      id,
      { name, price, category, image, featured: !!featured },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "🚫 المنتج غير موجود" });
    }

    res.status(200).json({ success: true, product: updated });
  } catch (error) {
    console.error("❌ خطأ أثناء التحديث:", error);
    res.status(500).json({
      message: "❌ فشل في تحديث المنتج",
      error: (error as any).message,
    });
  }
}
