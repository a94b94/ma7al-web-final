// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI غير معرف في .env أو إعدادات Vercel");
}

// كاش عالمي لمنع إعادة الاتصال المتكرر
let cached = (global as any).mongoose || { conn: null, promise: null };

export default async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // عدد الاتصالات المتزامنة
      serverSelectionTimeoutMS: 5000, // لتقليل تأخير الاتصال
      socketTimeoutMS: 10000, // أقصى مهلة للـ socket
      family: 4, // لتجنب مشاكل IPv6 في بعض الاستضافات
    }).then((mongoose) => {
      console.log("✅ تم الاتصال بقاعدة البيانات");
      return mongoose;
    }).catch((err) => {
      console.error("❌ خطأ في الاتصال بقاعدة البيانات:", err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
