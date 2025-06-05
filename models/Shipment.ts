import mongoose, { Schema, Document, Types } from "mongoose";

interface ShipmentProduct {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IShipment extends Document {
  supplier?: string;
  products: ShipmentProduct[];
  receivedAt: Date;
  reference?: string;
  note?: string;
  storeId?: Types.ObjectId;
}

const shipmentSchema = new Schema<IShipment>(
  {
    supplier: { type: String, trim: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    receivedAt: {
      type: Date,
      default: Date.now,
    },
    reference: { type: String, trim: true },
    note: { type: String, trim: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store" },
  },
  { timestamps: true }
);

export default mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", shipmentSchema);
