// lib/auth.ts
import type { NextApiRequest } from "next";
import jwt from "jsonwebtoken";

export function verifyToken(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("Token is missing");
  const token = authHeader.replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_SECRET!);
}
