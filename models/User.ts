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
  role?: "owner" | "manager" | "support"; // ✅ لا يوجد "admin"
  uid?: string;
  cart?: CartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },

    storeName: { type: String, trim: true },
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

    uid: { type: String, trim: true },

    cart: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ عدم تكرار النموذج عند التطوير
const User: mongoose.Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
