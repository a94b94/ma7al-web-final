// pages/api/store-info.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User"; // ✅ يحتوي على بيانات المتجر

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  try {
    await connectDB();

    const { storeId } = req.query;

    if (!storeId || typeof storeId !== "string") {
      return res.status(400).json({ error: "⚠️ storeId مطلوب" });
    }

    const store = await User.findById(storeId).select("storeName storeLogo address phone email");

    if (!store) {
      return res.status(404).json({ error: "❌ لم يتم العثور على المتجر" });
    }

    res.status(200).json({
      name: store.storeName || "اسم غير متوفر",
      logo: store.storeLogo || "",
      address: store.address || "غير محدد",
      phone: store.phone || "غير متوفر",
      email: store.email || "غير متوفر",
    });
  } catch (error: any) {
    console.error("❌ Store Info Error:", error.message);
    res.status(500).json({ error: "⚠️ فشل في جلب بيانات المتجر" });
  }
}
