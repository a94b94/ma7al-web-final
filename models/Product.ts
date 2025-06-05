import mongoose, { Schema, Document, Model, Types } from "mongoose";

// واجهة المنتج
export interface IProduct extends Document {
  name: string;
  sku?: string;
  price: number;
  images: string[];
  category: string;
  isFeatured: boolean;
  discount?: number;
  stock?: number;
  location?: string;
  storeId: Types.ObjectId; // ربط المنتج بصاحب المحل
  published?: boolean;
}

const ProductSchema: Schema<IProduct> = new mongoose.Schema(
  {
    // 🏷️ اسم المنتج
    name: { type: String, required: true, trim: true },

    // 🔖 رقم SKU مميز
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // 💰 السعر
    price: { type: Number, required: true, min: 0 },

    // 🖼️ الصور (رابط صورة أو أكثر)
    images: { type: [String], required: true },

    // 🗂️ القسم (اختياري: يمكن جعله enum)
    category: { type: String, required: true, trim: true },

    // ⭐ منتج مميز؟
    isFeatured: { type: Boolean, default: false },

    // 🏷️ نسبة الخصم
    discount: { type: Number, default: 0, min: 0 },

    // 📦 الكمية في المخزون
    stock: { type: Number, default: 0, min: 0 },

    // 📍 الموقع داخل المحل أو المخزن
    location: { type: String, default: "", trim: true },

    // 🏪 ربط المنتج بصاحب المتجر
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // أو "Store" إذا تستخدم موديل منفصل للمحل
      required: true,
      index: true,
    },

    // ✅ منشور؟
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🧠 إنشاء أو استخدام الموديل
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
