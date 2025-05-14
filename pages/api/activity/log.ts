// pages/api/activity/log.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import Activity from "@/models/Activity";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { userId, productId, category, action } = req.body;

  if (!productId || !action || !category) {
    return res.status(400).json({ error: "بيانات ناقصة" });
  }

  await connectDB();

  await Activity.create({
    userId: userId || "guest",
    productId,
    category,
    action,
  });

  res.status(200).json({ success: true });
}
