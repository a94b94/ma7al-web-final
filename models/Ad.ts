// models/Ad.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAd extends Document {
  productId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  expiresAt: Date;
}

const AdSchema: Schema = new Schema<IAd>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Ad || mongoose.model<IAd>('Ad', AdSchema);
