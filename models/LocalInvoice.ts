import mongoose, { Document, Schema, Model } from "mongoose";

export interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export interface LocalInvoiceDocument extends Document {
  phone: string;
  address: string;
  customerName?: string;
  sentBy?: string;
  cart: CartItem[];
  total: number;
  type: "cash" | "installment";
  downPayment?: number;
  installmentsCount?: number;
  dueDate?: string;
  remaining?: number;
  paid?: number;
  discount?: number;
  storeId?: string;
  storeName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<CartItem>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const LocalInvoiceSchema = new Schema<LocalInvoiceDocument>(
  {
    phone: { type: String, required: true },
    address: { type: String, required: true },

    customerName: { type: String, default: "زبون محلي" },
    sentBy: { type: String, default: "مشرف" },

    cart: { type: [CartItemSchema], required: true },

    total: { type: Number, required: true },
    type: { type: String, enum: ["cash", "installment"], default: "cash" },

    downPayment: { type: Number, default: 0 },
    installmentsCount: { type: Number, default: 0 },
    dueDate: { type: String },
    remaining: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

    storeId: { type: String, default: "default" },
    storeName: { type: String, default: "Ma7al Store" },
  },
  { timestamps: true }
);

const LocalInvoice: Model<LocalInvoiceDocument> =
  mongoose.models.LocalInvoice ||
  mongoose.model<LocalInvoiceDocument>("LocalInvoice", LocalInvoiceSchema);

export default LocalInvoice;
