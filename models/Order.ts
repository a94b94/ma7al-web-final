import mongoose, { Document, Model, Schema } from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

export interface IOrder extends Document {
  phone: string;
  customerName?: string;
  customerPhone?: string;
  sentBy?: string;
  address: string;

  cart: {
    name: string;
    quantity: number;
    price: number;
    productId?: mongoose.Types.ObjectId;
    storeId?: mongoose.Types.ObjectId; // مال المتجر الخاص بهذا المنتج
    storeName?: string;
  }[];

  total: number;
  discount?: number; // ✅ جديد
  paid?: number;
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
    late?: boolean;
    lateFee?: number;
  }[];

  email?: string;

  // ✅ ربط الطلب بالمتجر (المتجر = User حسب store-info.ts)
  storeId: mongoose.Types.ObjectId;
  storeName: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const InstallmentSchema = new Schema(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paidAt: { type: Date },
    late: { type: Boolean, default: false },
    lateFee: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    phone: { type: String, required: true },
    customerName: { type: String, default: "زبون محلي" },
    customerPhone: { type: String },
    sentBy: { type: String, default: "مشرف" },
    address: { type: String, required: true },

    cart: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        productId: { type: ObjectId, ref: "Product" },

        // ✅ المتجر عندك User (صاحب المحل)
        storeId: { type: ObjectId, ref: "User" },
        storeName: { type: String },
      },
    ],

    total: { type: Number, required: true },
    discount: { type: Number, default: 0 }, // ✅ جديد
    paid: { type: Number, default: 0 },
    dueDate: { type: Date },
    seen: { type: Boolean, default: false },

    status: {
      type: String,
      enum: [
        "بانتظار التأكيد",
        "قيد المعالجة",
        "تم الشحن",
        "تم التوصيل",
        "مكتمل",
        "ملغي",
      ],
      default: "بانتظار التأكيد",
    },

    type: {
      type: String,
      enum: ["cash", "installment"],
      default: "cash",
    },

    downPayment: { type: Number, default: 0 },
    installmentsCount: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    installments: [InstallmentSchema],

    email: { type: String },

    // ✅ ربط الطلب بالمتجر فعليًا (نفس storeId المستخدم في split.ts + store-info.ts)
    storeId: { type: ObjectId, ref: "User", required: true },
    storeName: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ بديل صحيح لحساب التأخير/الغرامة للأقساط داخل array
OrderSchema.pre("save", function (next) {
  try {
    const doc = this as any;

    if (Array.isArray(doc.installments) && doc.installments.length) {
      const today = new Date();
      for (const inst of doc.installments) {
        if (!inst.paid && inst.date && new Date(inst.date) < today) {
          inst.late = true;
          inst.lateFee = inst.lateFee ?? 1000; // تقدر تغيّرها لاحقًا
        } else {
          inst.late = false;
          inst.lateFee = 0;
        }
      }
    }

    // ✅ remaining افتراضيًا إذا ما انحسب
    if (typeof doc.remaining !== "number" || doc.remaining === 0) {
      const total = typeof doc.total === "number" ? doc.total : 0;
      const paid = typeof doc.paid === "number" ? doc.paid : 0;
      const discount = typeof doc.discount === "number" ? doc.discount : 0;
      doc.remaining = Math.max(total - discount - paid, 0);
    }

    next();
  } catch {
    next();
  }
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
