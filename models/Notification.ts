import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  orderId?: mongoose.Types.ObjectId;
  userId: string; // رقم الهاتف أو معرف المستخدم
  message: string;
  sentBy?: string; // اسم المشرف أو النظام
  type?: "status" | "order" | "invoice" | "installment";
  installmentIndex?: number;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: false,
    },
    userId: {
      type: String,
      required: [true, "معرف المستخدم (userId) مطلوب"],
    },
    message: {
      type: String,
      required: [true, "نص الإشعار (message) مطلوب"],
    },
    sentBy: {
      type: String,
      default: "system",
    },
    type: {
      type: String,
      enum: ["status", "order", "invoice", "installment"],
      default: "status",
    },
    installmentIndex: {
      type: Number,
      required: false,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // يضيف createdAt و updatedAt
  }
);

// ✅ تجنب إعادة تعريف الموديل في Hot Reload
const NotificationModel: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
