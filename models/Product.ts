import mongoose, { Schema, Document, Model, Types } from "mongoose";

// واجهة المنتج
export interface IProduct extends Document {
  name: string;
  sku?: string;
  price: number;
  images: string[];
  category: string;

  // ✅ توحيد الاسم
  isFeatured: boolean;

  discount?: number;
  stock?: number;
  location?: string;

  // ✅ ربط المنتج بصاحب المحل (User)
  storeId: Types.ObjectId;

  // ✅ منشور
  published: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema: Schema<IProduct> = new mongoose.Schema(
  {
    // 🏷️ اسم المنتج
    name: { type: String, required: true, trim: true, index: true },

    // 🔖 SKU
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // 💰 السعر
    price: { type: Number, required: true, min: 0, index: true },

    // 🖼️ الصور
    images: { type: [String], required: true },

    // 🗂️ القسم
    category: { type: String, required: true, trim: true, index: true },

    // ⭐ منتج مميز؟
    isFeatured: { type: Boolean, default: false, index: true },

    // 🏷️ الخصم (نسبة أو مبلغ حسب تصميمك—أنت حالياً نسبة غالبًا)
    discount: { type: Number, default: 0, min: 0, index: true },

    // 📦 المخزون
    stock: { type: Number, default: 0, min: 0 },

    // 📍 موقع داخل المخزن
    location: { type: String, default: "", trim: true },

    // 🏪 ربط المنتج بصاحب المتجر (User)
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ منشور
    published: { type: Boolean, default: true, index: true },

    // ✅ توافق مع API القديم الذي يستخدم isPublished
    // (مخزن بنفس القيمة تلقائيًا عند الحفظ)
    isPublished: { type: Boolean, default: true, index: true },
  } as any,
  { timestamps: true }
);

// ✅ حافظ على تزامن published و isPublished دائماً
ProductSchema.pre("save", function (next) {
  const doc = this as any;

  // إذا واحد منهم تغيّر، خلي الاثنين نفس القيمة
  if (typeof doc.published === "boolean") doc.isPublished = doc.published;
  if (typeof doc.isPublished === "boolean") doc.published = doc.isPublished;

  next();
});

// ✅ فهرس مركب مفيد للمتاجر المتعددة
ProductSchema.index({ storeId: 1, createdAt: -1 });

// 🧠 إنشاء أو استخدام الموديل
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
