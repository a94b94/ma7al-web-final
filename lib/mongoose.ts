import mongoose from "mongoose";

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("❌ MONGODB_URI غير محدد في المتغيرات البيئية");
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ تم الاتصال بقاعدة البيانات MongoDB");
  } catch (error) {
    console.error("❌ فشل الاتصال بقاعدة البيانات:", error);
    throw error;
  }
}
