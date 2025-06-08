// lib/auth.ts
import type { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

export interface DecodedToken {
  id: string;
  email: string;
  name?: string;
  role?: "admin" | "manager" | "support" | string; // 👈 أنواع الصلاحيات
  iat?: number;
  exp?: number;
}

// ✅ التحقق من التوكن
export function verifyToken(req: NextApiRequest): DecodedToken | null {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== "string") return null;

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    return decoded;
  } catch (err) {
    console.error("❌ فشل التحقق من التوكن:", err);
    return null;
  }
}

// ✅ إنشاء التوكن
export function signToken(payload: {
  id: string;
  email: string;
  name?: string;
  role?: string;
}): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}
