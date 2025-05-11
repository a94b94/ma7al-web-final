import mongoose, { Document, Schema, Model } from "mongoose";

export interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export interface LocalInvoiceDocument extends Document {
  phone: string;
  address: string;
  customerName?: string;  // ✅ جديد
  sentBy?: string;        // ✅ جديد
  cart: CartItem[];
  total: number;
  type: "cash" | "installment";
  downPayment?: number;
  installmentsCount?: number;
  dueDate?: string;
  remaining?: number;
  paid?: number;
  discount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocalInvoiceSchema = new Schema<LocalInvoiceDocument>(
  {
    phone: { type: String, required: true },
    address: { type: String, required: true },
    customerName: { type: String },   // ✅
    sentBy: { type: String },         // ✅
    cart: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    total: { type: Number, required: true },
    type: { type: String, enum: ["cash", "installment"], default: "cash" },
    downPayment: Number,
    installmentsCount: Number,
    dueDate: String,
    remaining: Number,
    paid: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LocalInvoice: Model<LocalInvoiceDocument> =
  mongoose.models.LocalInvoice ||
  mongoose.model<LocalInvoiceDocument>("LocalInvoice", LocalInvoiceSchema);

export default LocalInvoice;
