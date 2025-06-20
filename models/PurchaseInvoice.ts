import { Schema, model, models, Document, Model, Types } from "mongoose";

// 🧩 واجهة TypeScript لفاتورة الشراء
export interface PurchaseInvoiceType extends Document {
  supplierName: string;
  invoiceNumber: string;
  date: Date;
  products: Types.ObjectId[]; // سيتم ربطها بـ InventoryProduct[]
  createdAt: Date;
  updatedAt: Date;
}

// 🧱 مخطط Mongoose
const PurchaseInvoiceSchema = new Schema<PurchaseInvoiceType>(
  {
    supplierName: { type: String, required: true, trim: true },
    invoiceNumber: { type: String, required: true, trim: true, unique: true },
    date: { type: Date, default: Date.now },
    products: [{ type: Schema.Types.ObjectId, ref: "InventoryProduct" }],
  },
  {
    timestamps: true, // ⏱️ يضيف createdAt و updatedAt تلقائيًا
  }
);

// 🏷️ التصدير
const PurchaseInvoice: Model<PurchaseInvoiceType> =
  models.PurchaseInvoice || model<PurchaseInvoiceType>("PurchaseInvoice", PurchaseInvoiceSchema);

export default PurchaseInvoice;
