import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  userId?: string;
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
    action: {
      type: String,
      enum: ["viewed", "added_to_cart", "purchased"],
      required: true,
    },
  },
  { timestamps: true }
);

const ActivityModel: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

export default ActivityModel;
