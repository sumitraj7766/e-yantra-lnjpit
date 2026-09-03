import mongoose, { Schema, Model } from 'mongoose';

export interface INotification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'alert' | 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | string;
  targetRole?: string;
  recipientRole?: string;
  targetUser?: string;
  recipientEmail?: string;
  recipientUserId?: string;
  link?: string;
  isRead?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    id: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' },
    targetRole: { type: String, default: 'ALL', index: true },
    recipientRole: { type: String, default: 'ALL', index: true },
    targetUser: { type: String, index: true },
    recipientEmail: { type: String, index: true },
    recipientUserId: { type: String, index: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        delete ret.__v;
        delete ret._id;
        return ret;
      }
    }
  }
);

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default NotificationModel;
