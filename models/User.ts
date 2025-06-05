import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  storeName: string;
  storeLogo?: string;
  storeStamp?: string;
  location: string; // ✅ الموقع (المحافظة)
  image?: string;
  role?: "owner" | "manager" | "support";
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    storeName: { type: String, required: true, unique: true },
    storeLogo: { type: String, default: "" },
    storeStamp: { type: String, default: "" },
    location: { type: String, required: true, trim: true }, // ✅ مضاف حديثًا

    image: { type: String, default: "" },
    role: {
      type: String,
      enum: ["owner", "manager", "support"],
      default: "manager",
    },
  },
  { timestamps: true }
);

const User: mongoose.Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
