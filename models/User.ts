import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  storeName: string;
  storeLogo?: string;
  storeStamp?: string;
  image?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    storeName: { type: String, required: true },
    storeLogo: String,
    storeStamp: String,
    image: String,
  },
  { timestamps: true }
);

// ✅ حل مشكلة findOne عبر تحديد النوع بوضوح
const User: mongoose.Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default User;
