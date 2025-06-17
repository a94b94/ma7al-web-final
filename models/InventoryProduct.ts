import { Schema, model, models, Document, Model } from "mongoose";

// 🧩 تعريف الخصائص المطلوبة لمنتج المخزن
export interface InventoryProductType extends Document {
  name: string;
  barcode?: string;
  category?: string;
  purchasePrice: number;
  quantity: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 🧱 مخطط Mongoose
const InventoryProductSchema = new Schema<InventoryProductType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    barcode: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
      maxlength: 50,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // ⏱️ يضيف createdAt و updatedAt تلقائيًا
  }
);

// ✅ تصدير النموذج
const InventoryProduct: Model<InventoryProductType> =
  models.InventoryProduct || model<InventoryProductType>("InventoryProduct", InventoryProductSchema);

export default InventoryProduct;
