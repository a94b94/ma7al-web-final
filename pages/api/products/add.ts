// pages/api/products/add.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Product from "@/models/Product";
import NotificationModel from "@/models/Notification";
import redis from "@/lib/redis";
import { verifyToken } from "@/lib/auth";
import type { HydratedDocument } from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "❌ الطريقة غير مسموحة" });
  }

  try {
    await connectDB();

    const user = verifyToken(req);
    if (!user || !user.id || user.role !== "manager") {
      return res.status(401).json({ message: "🚫 غير مصرح لك بإضافة منتج" });
    }

    const {
      name,
      price,
      category,
      images,
      isFeatured = false,
      discount = 0,
      stock = 0,
      location = "",
    } = req.body;

    if (!name || !price || !category || !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "❌ تأكد من إدخال الاسم، السعر، القسم، والصورة" });
    }

    const newProduct: HydratedDocument<typeof Product.prototype> = await Product.create({
      name: name.trim(),
      price: Number(price),
      category: category.trim(),
      images: images.map((img: string) => img.trim()),
      isFeatured,
      discount: Number(discount),
      stock: Number(stock),
      location: location.trim(),
      storeId: user.id,
    });

    await NotificationModel.create({
      userId: user.id,
      type: "product_add",
      title: `🆕 منتج جديد`,
      message: `تم إضافة المنتج (${newProduct.name}) بنجاح`,
      seen: false,
      orderId: null,
    });

    const cacheKey = `product:${newProduct._id.toString()}`;
    await redis.set(
      cacheKey,
      JSON.stringify({
        ...newProduct.toObject(),
        _id: newProduct._id.toString(),
      }),
      "EX",
      600
    );

    return res.status(201).json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error("❌ فشل في إنشاء المنتج:", err.message);
    return res.status(500).json({ message: "⚠️ خطأ في السيرفر، حاول لاحقًا" });
  }
}
