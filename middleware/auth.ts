// ✅ ملف: middleware/auth.ts
import jwt from "jsonwebtoken";
import type { NextApiRequest } from "next";

interface DecodedToken {
  userId: string;
  storeId?: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ✅ استخراج التوكن من الهيدر
function extractToken(req: NextApiRequest): string {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    throw new Error("⚠️ التوكن مفقود أو غير صالح");
  }

  return authHeader.split(" ")[1];
}

// ✅ التحقق من صحة التوكن وإرجاع البيانات
export function verifyToken(req: NextApiRequest): DecodedToken {
  const token = extractToken(req);
  const secret = process.env.JWT_SECRET || "Abdullaha94b1994ASDF";

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;

    if (!decoded.userId || !decoded.role) {
      throw new Error("🚫 بيانات التوكن غير مكتملة");
    }

    return decoded;
  } catch (error: any) {
    console.error("❌ JWT Verify Error:", error.message);
    throw new Error("🚫 التوكن غير صالح أو منتهي الصلاحية");
  }
}

// ✅ إنشاء توكن جديد (استخدمه في login/register)
export function signToken(payload: { userId: string; role: string; storeId?: string }): string {
  const secret = process.env.JWT_SECRET || "Abdullaha94b1994ASDF";
  const expiresIn = "30d";

  return jwt.sign(payload, secret, { expiresIn });
}
