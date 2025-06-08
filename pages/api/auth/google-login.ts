import { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY || "{}");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: "ID Token is required" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid, picture } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        uid,
        image: picture,
      });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({ token, user });
  } catch (error: any) {
    console.error("Firebase verify error:", error);
    return res.status(401).json({ error: "Invalid ID token" });
  }
}
