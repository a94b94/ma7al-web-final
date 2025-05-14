// models/Activity.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  userId?: string; // ممكن يكون رقم الهاتف أو ID الزبون أو "guest-[uuid]"
  productId: string;
  category: string;
  action: "viewed" | "added_to_cart" | "purchased";
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: String },
    productId: { type: String, required: true },
    category: { type: String },
    action: { type: String, enum: ["viewed", "added_to_cart", "purchased"], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
