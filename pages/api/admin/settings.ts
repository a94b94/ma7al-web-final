
import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth"; // تأكد من التحقق من التوكن لو تستخدم حماية

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "الطريقة غير مسموحة" });
  }

  const { userId, storeName, storeLogo, whatsappNumber } = req.body;

  if (!userId || !storeName) {
    return res.status(400).json({ error: "❗ اسم المتجر ومعرف المستخدم مطلوبان" });
  }

  try {
    await connectToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        storeName,
        storeLogo,
        whatsappNumber,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "لم يتم العثور على المستخدم" });
    }

    return res.status(200).json({ message: "✅ تم تحديث إعدادات المتجر بنجاح", user: updatedUser });
  } catch (error) {
    console.error("خطأ في حفظ الإعدادات:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء التحديث" });
  }
}
