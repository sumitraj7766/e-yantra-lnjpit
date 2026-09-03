import mongoose, { Schema, Model } from 'mongoose';

export interface IContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: 'Unread' | 'Read' | 'Replied' | string;
  isRead?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    id: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: '' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      default: 'Unread',
      index: true
    },
    isRead: { type: Boolean, default: false }
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

export const ContactMessageModel: Model<IContactMessage> =
  mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
export default ContactMessageModel;
