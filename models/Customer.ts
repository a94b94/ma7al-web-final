import mongoose, { Schema, model, models, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  phone: string;
  address: string;
  paymentStatus: string;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  paymentStatus: { type: String, required: true },
});

const Customer: Model<ICustomer> = models.Customer || model<ICustomer>("Customer", CustomerSchema);
export default Customer;
