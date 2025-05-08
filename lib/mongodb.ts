import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI غير معرف في .env أو Vercel Environment Variables");
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export default async function connectToDatabase() {
  if (cached.conn) {
    console.log("ℹ️ قاعدة البيانات متصلة مسبقًا (cached)");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
    .then((mongoose) => {
      console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
      return mongoose;
    })
    .catch((err) => {
      console.error("❌ فشل الاتصال بقاعدة البيانات:", err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
