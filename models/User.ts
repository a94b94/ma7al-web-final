import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  storeName: string;
  storeLogo?: string;
  storeStamp?: string;
  image?: string;
  role?: "owner" | "manager" | "support"; // ✅ تمت الإضافة هنا
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    storeName: { type: String, required: true, unique: true },
    storeLogo: { type: String, default: "" },
    storeStamp: { type: String, default: "" },
    image: { type: String, default: "" },
    role: { type: String, enum: ["owner", "manager", "support"], default: "manager" }, // ✅ تمت الإضافة هنا
  },
  { timestamps: true }
);

const User: mongoose.Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
