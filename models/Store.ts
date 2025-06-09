import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStore extends Document {
  name: string;
  phone: string;
  logo?: string;
  ownerId?: mongoose.Types.ObjectId;
  storeId?: string;
  type?: "store" | "company" | "dealer" | "exhibition";
  location?: string; // ✅ مضافة لتجنب الخطأ
  createdAt?: Date;
  updatedAt?: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    storeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["store", "company", "dealer", "exhibition"],
      default: "store",
    },
    location: {
      type: String,
      default: "", // ✅ مضافة هنا
      trim: true,
    },
  },
  { timestamps: true }
);

// ✅ توليد storeId تلقائي إن لم يكن موجودًا
StoreSchema.pre<IStore>("save", function (next) {
  const self = this as IStore;
  if (!self.storeId && self._id) {
    const suffix = self._id.toString().slice(-6);
    self.storeId = `STR-${suffix}`;
  }
  next();
});

const Store: Model<IStore> =
  mongoose.models.Store || mongoose.model<IStore>("Store", StoreSchema);

export default Store;
