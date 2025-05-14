import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  orderId?: mongoose.Types.ObjectId;
  userId: string; // يمكن أن يكون رقم الهاتف أو ID المستخدم
  message: string;
  sentBy?: string;
  type?: "status" | "order" | "invoice" | "installment";
  installmentIndex?: number;
  createdAt: Date;
  updatedAt: Date;
  seen?: boolean;
}

const NotificationSchema = new Schema<INotification>(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    userId: { type: String, required: true }, // الهاتف أو معرف المستخدم
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
    timestamps: true, // يضيف createdAt و updatedAt
  }
);

const NotificationModel: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
