// pages/api/settings/hero-images.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import mongoose from "mongoose";

// ✅ تعريف موديل الإعدادات
const settingsSchema = new mongoose.Schema(
  {
    heroImages: {
      phone: { type: String, default: "" },
      appliance: { type: String, default: "" },
      background: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    if (req.method === "GET") {
      const settings = await Settings.findOne({});
      return res.status(200).json(settings?.heroImages || {});
    }

    if (req.method === "POST") {
      const { phone = "", appliance = "", background = "" } = req.body;

      const updated = await Settings.findOneAndUpdate(
        {},
        {
          heroImages: {
            phone,
            appliance,
            background,
          },
        },
        { upsert: true, new: true }
      );

      return res.status(200).json(updated.heroImages);
    }

    return res.status(405).json({ error: "❌ Method Not Allowed" });
  } catch (err) {
    console.error("❌ Hero Image API Error:", err);
    return res.status(500).json({ error: "🚨 فشل في تنفيذ الطلب" });
  }
}
