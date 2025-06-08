// pages/api/stores/cities.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const distinctCities = await User.distinct("location");

    const rawCities = Array.isArray(distinctCities) ? distinctCities : [];

    const cities = (rawCities as string[])
      .filter((c) => typeof c === "string" && c.trim() !== "")
      .map((c) => c.trim())
      .sort((a, b) => a.localeCompare(b, "ar", { sensitivity: "base" }));

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(cities);
  } catch (error: any) {
    console.error("❌ Failed to fetch cities:", error.message || error);
    res.status(500).json({ error: "⚠️ فشل في جلب المدن" });
  }
}
