import { Schema, model, models, Document, Model, Types } from "mongoose";

export interface PurchaseInvoiceType extends Document {
  supplierName: string;
  invoiceNumber: string;
  date: Date;
  products: Types.ObjectId[];
  createdAt: Date;
}

const PurchaseInvoiceSchema = new Schema<PurchaseInvoiceType>({
  supplierName: { type: String, required: true },
  invoiceNumber: { type: String, required: true },
  date: { type: Date, default: Date.now },
  products: [{ type: Schema.Types.ObjectId, ref: "InventoryProduct" }],
  createdAt: { type: Date, default: Date.now },
});

const PurchaseInvoice: Model<PurchaseInvoiceType> =
  models.PurchaseInvoice || model<PurchaseInvoiceType>("PurchaseInvoice", PurchaseInvoiceSchema);

export default PurchaseInvoice;
