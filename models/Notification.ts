import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  orderId?: mongoose.Types.ObjectId;
  customerPhone: string;
  message: string;
  sentBy?: string;
  type?: string;
  installmentIndex?: number;
}

const NotificationSchema = new Schema<INotification>(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    customerPhone: { type: String, required: true },
    message: { type: String, required: true },
    sentBy: { type: String },
    type: { type: String, default: "status" },
    installmentIndex: { type: Number },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default NotificationModel;
