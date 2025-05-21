// lib/mongoose.js أو mongoose.ts
import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("❌ MONGODB_URI غير محدد في المتغيرات البيئية");
  }

  try {
    const db = await mongoose.connect(uri, {
      // خيارات إضافية لتفادي التحذيرات
      bufferCommands: false,
    });
    isConnected = true;
    console.log("✅ تم الاتصال بقاعدة البيانات MongoDB");
  } catch (error) {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", error);
    throw error;
  }
}
