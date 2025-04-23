import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/utils/dbConnect"; // استخدم مسارك الصحيح
import User from "@/models/User";
import { verify } from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Invalid method" });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    await connectToDatabase();

    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { cart } = req.body;

    if (!Array.isArray(cart)) {
      return res.status(400).json({ error: "Invalid cart format" });
    }

    await User.findByIdAndUpdate(decoded.userId, { cart });

    res.status(200).json({ message: "✅ تم حفظ السلة في الحساب" });
  } catch (err) {
    console.error("❌ Error saving cart:", err);
    res.status(500).json({ error: "❌ فشل حفظ السلة" });
  }
}
