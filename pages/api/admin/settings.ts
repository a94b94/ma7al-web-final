// pages/api/admin/settings.ts
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
// import { verifyToken } from "@/lib/auth"; // فعّل إذا كنت تستخدم JWT

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "❌ الطريقة غير مسموحة" });
  }

  const { userId, storeName, storeLogo, whatsappNumber } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "❗ معرف المستخدم مطلوب" });
  }

  if (!storeName || typeof storeName !== "string") {
    return res.status(400).json({ error: "❗ اسم المتجر مطلوب" });
  }

  try {
    await connectToDatabase();

    // 🛡️ تحقق من التوكن إن كنت تستخدم نظام JWT
    // const token = req.headers.authorization?.split(" ")[1];
    // const verified = await verifyToken(token);
    // if (!verified) return res.status(401).json({ error: "⚠️ غير مصرح" });

    const updateFields: any = { storeName };

    if (storeLogo && typeof storeLogo === "string") {
      updateFields.storeLogo = storeLogo;
    }

    if (whatsappNumber && typeof whatsappNumber === "string") {
      updateFields.whatsappNumber = whatsappNumber;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "❌ لم يتم العثور على المستخدم" });
    }

    return res.status(200).json({
      message: "✅ تم تحديث إعدادات المتجر بنجاح",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("❌ خطأ في حفظ الإعدادات:", error);
    return res.status(500).json({
      error: "⚠️ حدث خطأ أثناء التحديث: " + error.message,
    });
  }
}
