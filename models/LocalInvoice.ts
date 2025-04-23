import mongoose from "mongoose";

const LocalInvoiceSchema = new mongoose.Schema(
  {
    phone: String,
    address: String,
    cart: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    total: Number,
    type: { type: String, enum: ["cash", "installment"], default: "cash" },
    downPayment: Number,
    installmentsCount: Number,
    dueDate: String,
    remaining: Number,
  },
  { timestamps: true }
);

export default mongoose.models.LocalInvoice ||
  mongoose.model("LocalInvoice", LocalInvoiceSchema);
