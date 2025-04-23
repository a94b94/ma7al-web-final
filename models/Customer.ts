
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: String,
    phone: { type: String, unique: true },
    address: String,
    paymentStatus: { type: String, enum: ["paid", "cod"], default: "cod" },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
