// pages/api/settings/hero-images.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import mongoose from "mongoose";

// ✅ تعريف موديل الإعدادات لو ما موجود
const settingsSchema = new mongoose.Schema(
  {
    heroImages: {
      phone: String,
      appliance: String,
    },
  },
  { timestamps: true }
);

const Settings =
  mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "GET") {
    const data = await Settings.findOne({});
    return res.status(200).json(data?.heroImages || {});
  }

  if (req.method === "POST") {
    const { phone, appliance } = req.body;

    const updated = await Settings.findOneAndUpdate(
      {},
      { heroImages: { phone, appliance } },
      { upsert: true, new: true }
    );

    return res.status(200).json(updated.heroImages);
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
