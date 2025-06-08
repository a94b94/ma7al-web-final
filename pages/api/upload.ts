import type { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // ⬅️ يضمن قبول صور عالية الجودة
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageBase64 } = req.body;

  if (!imageBase64 || typeof imageBase64 !== "string" || !imageBase64.startsWith("data:image/")) {
    return res.status(400).json({ error: "❗ صيغة الصورة غير صحيحة أو مفقودة" });
  }

  try {
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: "ma7al-store",
    });

    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id, // يمكن استخدامه لاحقًا للحذف أو التحديث
      message: "✅ تم رفع الصورة بنجاح",
    });
  } catch (err) {
    console.error("❌ Cloudinary Upload Error:", err);
    return res.status(500).json({
      error: "فشل رفع الصورة",
      details: err instanceof Error ? err.message : String(err),
    });
  }
}
