import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  sku?: string; // الباركود أو رمز المنتج
  price: number;
  images: string[];
  category: string;
  isFeatured: boolean;
  discount?: number;
  stock?: number;
  location?: string;
  storeId?: string;
  published?: boolean;
}

const ProductSchema: Schema<IProduct> = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], required: true },
    category: { type: String, required: true, trim: true },
    isFeatured: { type: Boolean, default: false },
    discount: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    location: { type: String, default: "", trim: true },
    storeId: { type: String, trim: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
