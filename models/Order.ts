import mongoose, { Document, Model, Schema } from "mongoose";

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
    productId?: string; // ✅ لإحصائيات المبيعات حسب المنتج
  }[];

  total: number;
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
  storeId: string;
  storeName: string;

  createdAt?: Date; // ✅ لحساب المبيعات الشهرية
  updatedAt?: Date; // ✅ مفيد في إدارة التقارير/الطلبات
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

// ✅ إعداد حالة القسط تلقائيًا إذا تأخر
InstallmentSchema.pre("save", function (next) {
  const today = new Date();
  const installment = this as any;

  if (!installment.paid && new Date(installment.date) < today) {
    installment.late = true;
    installment.lateFee = 1000;
  } else {
    installment.late = false;
    installment.lateFee = 0;
  }

  next();
});

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
        productId: { type: String }, // ✅ يفضل وجوده للتحليل الدقيق
      },
    ],

    total: { type: Number, required: true },
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
    storeId: { type: String, required: true },
    storeName: { type: String, required: true },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
