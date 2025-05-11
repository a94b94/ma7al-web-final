// models/Order.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
  phone: string;
  customerName?: string; // ✅ مضاف
  customerPhone?: string; // ✅ إذا استخدمته
  sentBy?: string; // ✅ مضاف
  address: string;
  cart: { name: string; quantity: number; price: number }[];
  total: number;
  dueDate?: Date;
  seen?: boolean;
  status?: string;
  type: "cash" | "installment";
  downPayment?: number;
  installmentsCount?: number;
  remaining?: number;
  installments?: {
    date: Date;
    amount: number;
    paid: boolean;
    paidAt?: Date;
  }[];
  email?: string;
  storeId: string;
  storeName: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    phone: { type: String, required: true },
    customerName: { type: String }, // ✅ مضاف
    customerPhone: { type: String }, // اختياري حسب الحاجة
    sentBy: { type: String }, // ✅ مضاف
    address: { type: String, required: true },
    cart: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    dueDate: { type: Date },
    seen: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["بانتظار التأكيد", "قيد المعالجة", "تم الشحن", "تم التوصيل", "مكتمل", "ملغي"],
      default: "بانتظار التأكيد",
    },
    type: { type: String, enum: ["cash", "installment"], default: "cash" },
    downPayment: { type: Number, default: 0 },
    installmentsCount: { type: Number, default: 0 },
    remaining: { type: Number },
    installments: [
      {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        paid: { type: Boolean, default: false },
        paidAt: { type: Date },
      },
    ],
    email: { type: String },
    storeId: { type: String, required: true },
    storeName: { type: String, required: true },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
