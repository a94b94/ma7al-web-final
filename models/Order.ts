import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
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
      enum: [
        "بانتظار التأكيد",
        "قيد المعالجة",
        "تم الشحن",
        "تم التوصيل",
        "مكتمل",
        "ملغي"
      ],
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

    // ✅ جديد: ربط الطلب بالمحل
    storeId: { type: String, required: true },
    storeName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
