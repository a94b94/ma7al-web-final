import jwt from "jsonwebtoken";
import type { NextApiRequest } from "next";

// تحقق من وجود التوكن وصحته
export function verifyToken(req: NextApiRequest) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("⚠️ التوكن مفقود");
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "Abdullaha94b1994ASDF";

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("🚫 التوكن غير صالح أو منتهي");
  }
}
