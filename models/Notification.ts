import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  orderId?: mongoose.Types.ObjectId;
  customerPhone: string;
  message: string;
  sentAt?: Date;
  sentBy?: string;
  type?: string;
  installmentIndex?: number;
}

const NotificationSchema = new Schema<INotification>(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    customerPhone: { type: String, required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    sentBy: { type: String },
    type: { type: String },
    installmentIndex: { type: Number },
  },
  { timestamps: true }
);

const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
