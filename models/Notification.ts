import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  title: string;
  type: string;
  recipientRole: string;
  restaurantId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  recipientRole: { type: String, required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
