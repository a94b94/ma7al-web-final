import mongoose, { Schema, Document, Types } from "mongoose";

// ✅ واجهة المنتج داخل الشحنة
export interface ShipmentProduct {
  productId: Types.ObjectId;
  quantity: number;
}

// ✅ واجهة الشحنة
export interface IShipment extends Document {
  supplier?: string;
  products: ShipmentProduct[];
  receivedAt: Date;
  reference?: string;
  note?: string;
  storeId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ مخطط الشحنة
const shipmentSchema = new Schema<IShipment>(
  {
    supplier: {
      type: String,
      trim: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    reference: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
    },
  },
  {
    timestamps: true, // ✅ مهم لتتبع الإنشاء والتعديل
    versionKey: false, // ⛔ يزيل __v تلقائيًا إن كنت لا تستخدمه
  }
);

// ✅ التصدير
export default mongoose.models.Shipment ||
  mongoose.model<IShipment>("Shipment", shipmentSchema);
