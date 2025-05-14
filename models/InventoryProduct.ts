import { Schema, model, models, Document, Model } from "mongoose";

export interface InventoryProductType extends Document {
  name: string;
  barcode?: string;
  category?: string;
  purchasePrice: number;
  quantity: number;
  isPublished: boolean;
  createdAt: Date;
}

const InventoryProductSchema = new Schema<InventoryProductType>({
  name: { type: String, required: true },
  barcode: { type: String },
  category: { type: String },
  purchasePrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const InventoryProduct: Model<InventoryProductType> =
  models.InventoryProduct || model<InventoryProductType>("InventoryProduct", InventoryProductSchema);

export default InventoryProduct;
