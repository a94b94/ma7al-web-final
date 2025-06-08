// pages/api/delete-image.ts
import type { NextApiRequest, NextApiResponse } from "next";
import cloudinary from "@/lib/cloudinary";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "❌ Method Not Allowed" });
  }

  const { public_id } = req.body;

  if (!public_id || typeof public_id !== "string") {
    return res.status(400).json({ success: false, error: "❗ public_id مطلوب لحذف الصورة" });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "not found") {
      return res.status(404).json({ success: false, error: "⚠️ الصورة غير موجودة في Cloudinary" });
    }

    return res.status(200).json({ success: true, message: "✅ تم حذف الصورة بنجاح", result });
  } catch (err) {
    console.error("❌ Cloudinary Deletion Error:", err);
    return res.status(500).json({ success: false, error: "فشل حذف الصورة من Cloudinary" });
  }
}
