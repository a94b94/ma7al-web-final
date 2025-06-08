// pages/api/stores/increment-views.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ Method Not Allowed" });
  }

  const { storeId } = req.body;

  if (!storeId) {
    return res.status(400).json({ error: "❗ storeId مطلوب" });
  }

  try {
    await connectToDatabase();

    await User.updateOne(
      { _id: storeId },
      { $inc: { views: 1 } },
      { upsert: false }
    );

    return res.status(200).json({ success: true, message: "✅ تم تحديث عدد الزيارات" });
  } catch (error: any) {
    console.error("❌ خطأ في تحديث الزيارات:", error?.message || error);
    return res.status(500).json({ error: "⚠️ فشل داخلي في الخادم" });
  }
}
