import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  orderId?: mongoose.Types.ObjectId;
  userId: string; // يمكن أن يكون رقم الهاتف أو معرف المستخدم
  message: string;
  sentBy?: string;
  type?: "status" | "order" | "invoice" | "installment";
  installmentIndex?: number;
  seen?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    userId: { type: String, required: true }, // يمكن أن يكون رقم الهاتف أو email أو ID
    message: { type: String, required: true },
    sentBy: { type: String },
    type: {
      type: String,
      enum: ["status", "order", "invoice", "installment"],
      default: "status",
    },
    installmentIndex: { type: Number },
    seen: { type: Boolean, default: false },
  },
  {
    timestamps: true, // يضيف createdAt و updatedAt تلقائيًا
  }
);

const NotificationModel: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
