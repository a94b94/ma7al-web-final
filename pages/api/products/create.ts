// pages/api/products/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { HydratedDocument } from "mongoose";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Notification from "@/models/Notification";
import redis from "@/lib/redis";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "❌ الطريقة غير مسموحة" });
  }

  try {
    await dbConnect();

    const user = verifyToken(req);
    if (!user || !user.id || !["manager", "owner"].includes(user.role || "")) {
      return res.status(401).json({ message: "❌ غير مصرح لك بإضافة المنتجات" });
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
      barcode,
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof price !== "number" ||
      typeof category !== "string" ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return res.status(400).json({ message: "❗ تأكد من إدخال الاسم، السعر، القسم، والصورة" });
    }

    const newProduct = await Product.create({
      name: name.trim(),
      price,
      category: category.trim(),
      images: images.map((img: string) => img.trim()),
      isFeatured,
      discount,
      stock,
      location: location?.trim() || "",
      barcode: barcode?.trim() || "",
      storeId: user.id,
    }) as HydratedDocument<typeof Product.prototype>;

    await Notification.create({
      userId: user.id,
      title: "🆕 منتج جديد",
      message: `تمت إضافة المنتج (${newProduct.name}) بنجاح.`,
      type: "product",
    });

    const cacheKey = `product:${newProduct._id.toString()}`;
    await redis.set(
      cacheKey,
      JSON.stringify({ ...newProduct.toObject(), _id: newProduct._id.toString() }),
      "EX",
      600
    );

    return res.status(201).json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error("❌ خطأ في إنشاء المنتج:", err.message);
    return res.status(500).json({ message: "⚠️ خطأ في السيرفر، حاول لاحقًا" });
  }
}
