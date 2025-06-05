// models/Ad.ts
import mongoose, { Schema, Document, Model, models } from "mongoose";

export interface IAd extends Document {
  productId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdSchema = new Schema<IAd>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "معرّف المنتج مطلوب"],
    },
    title: {
      type: String,
      required: [true, "عنوان الإعلان مطلوب"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "الوصف مطلوب"],
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "تاريخ الانتهاء مطلوب"],
    },
  },
  {
    timestamps: true,
  }
);

// ✅ استخدام models.Ad إذا كانت معرفة مسبقًا لتفادي أخطاء التكرار
const Ad: Model<IAd> = models.Ad || mongoose.model<IAd>("Ad", AdSchema);

export default Ad;
