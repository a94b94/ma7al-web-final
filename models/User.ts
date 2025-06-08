import mongoose, { Schema, model, models, Document } from "mongoose";

export interface CartItem {
  productId: string;
  quantity: number;
  [key: string]: any;
}

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  storeName?: string;
  storeLogo?: string;
  storeStamp?: string;
  location?: string;
  address?: string;
  phone?: string;
  image?: string;
  role?: "owner" | "manager" | "support";
  uid?: string;
  cart?: CartItem[]; // ✅ تمت الإضافة هنا
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },

    storeName: { type: String },
    storeLogo: { type: String, default: "" },
    storeStamp: { type: String, default: "" },
    location: { type: String, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },

    image: { type: String, default: "" },
    role: {
      type: String,
      enum: ["owner", "manager", "support"],
      default: "manager",
    },

    uid: { type: String },

    cart: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

const User: mongoose.Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
