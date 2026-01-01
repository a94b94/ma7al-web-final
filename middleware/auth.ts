// ✅ ملف: middleware/auth.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import type { NextApiRequest } from "next";

export type UserRole = "owner" | "manager" | "support" | "admin" | string;

export interface DecodedToken extends JwtPayload {
  userId: string;
  storeId?: string;
  role: UserRole;
}

/**
 * ✅ استخراج التوكن:
 * - أولاً: Authorization: Bearer <token>
 * - ثانيًا: cookies (token / accessToken / authToken)
 */
export function extractToken(req: NextApiRequest): string {
  const authHeader = req.headers.authorization;

  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (!token) throw new Error("TOKEN_MISSING");
    return token;
  }

  // دعم الكوكيز (لو عندك Cookie-based auth)
  const cookieToken =
    (req.cookies?.token as string) ||
    (req.cookies?.accessToken as string) ||
    (req.cookies?.authToken as string);

  if (cookieToken && typeof cookieToken === "string") {
    return cookieToken;
  }

  throw new Error("TOKEN_MISSING");
}

/**
 * ✅ الحصول على JWT Secret:
 * - إجباري من env (أفضل أمان)
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // لا نخلي fallback ثابت داخل الكود (خطر أمني)
    throw new Error("JWT_SECRET_MISSING");
  }
  return secret;
}

/**
 * ✅ verifyToken:
 * - يتحقق من التوكن ويرجع payload
 */
export function verifyToken(req: NextApiRequest): DecodedToken {
  const token = extractToken(req);
  const secret = getJwtSecret();

  try {
    const decoded = jwt.verify(token, secret) as DecodedToken;

    if (!decoded?.userId || !decoded?.role) {
      throw new Error("TOKEN_PAYLOAD_INVALID");
    }

    return decoded;
  } catch (err: any) {
    const msg = err?.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "TOKEN_INVALID";
    console.error("❌ JWT Verify Error:", msg, err?.message || err);
    throw new Error(msg);
  }
}

/**
 * ✅ signToken:
 * - اصنع توكن جديد
 */
export function signToken(payload: { userId: string; role: UserRole; storeId?: string }): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}

/**
 * ✅ أدوات جاهزة للـ APIs:
 * authorizeRoles: تحقق الصلاحية
 * requireStoreId: تأكد أن المتجر مرتبط
 */
export function authorizeRoles(user: DecodedToken, allowed: UserRole[]) {
  if (!allowed.includes(user.role)) {
    throw new Error("FORBIDDEN_ROLE");
  }
}

export function requireStoreId(user: DecodedToken) {
  if (!user.storeId) {
    throw new Error("STORE_ID_MISSING");
  }
}
