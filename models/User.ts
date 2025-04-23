import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // 👤 اسم المستخدم
    },
    storeName: {
      type: String,
      required: true, // 🏪 اسم المتجر
    },
    storeLogo: {
      type: String,
      default: "", // 🖼️ شعار المتجر (رابط صورة)
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    cart: {
      type: Array,
      default: [],
    },
    role: {
      type: String,
      enum: ["owner", "manager", "support"], // 👥 أنواع الصلاحيات
      default: "manager", // ✨ القيمة الافتراضية
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
