import mongoose, { Schema, model, models } from 'mongoose';

const SaleSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: Number,
      price: Number,
    },
  ],
  paymentType: { type: String, enum: ["cash", "installment"], required: true },
  downPayment: { type: Number, default: 0 },
  installmentsCount: { type: Number, default: 0 },
  dueDate: { type: Date, default: null },
  installments: [
    {
      date: Date,
      amount: Number,
      paid: { type: Boolean, default: false },
      paidAt: Date,
    },
  ],
  total: Number,
  paid: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default models.Sale || model("Sale", SaleSchema);
