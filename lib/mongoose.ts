// lib/mongoose.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI غير معرف في ملف البيئة");
}

// ✅ كاش اتصال عام يدعم hot reload في التطوير
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log("✅ تم الاتصال بقاعدة البيانات MongoDB");
      return mongoose;
    }).catch((err) => {
      console.error("❌ فشل الاتصال بقاعدة البيانات:", err);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
