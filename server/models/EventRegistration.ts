import mongoose, { Schema, Model } from 'mongoose';

export interface IEventRegistration {
  id: string;
  registrationId: string;
  eventId: string;
  eventTitle: string;
  userId?: string;
  name?: string;
  fullName: string;
  email: string;
  phone: string;
  college?: string;
  rollNo?: string;
  rollNumber?: string;
  branch?: string;
  department?: string;
  year?: string;
  teamName?: string;
  teamMembers?: string[];
  experienceLevel?: string;
  skillLevel?: string;
  customFormResponses?: Record<string, any>;
  status: 'REGISTERED' | 'APPROVED' | 'WAITLISTED' | 'CANCELLED' | 'ATTENDED' | 'ABSENT' | 'Confirmed' | string;
  attendance?: 'ATTENDED' | 'ABSENT' | 'PENDING' | string;
  registeredAt?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    id: { type: String, unique: true, required: true, index: true },
    registrationId: { type: String, unique: true, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    eventTitle: { type: String, required: true },
    userId: { type: String, index: true },
    name: { type: String, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    college: { type: String, default: 'LNJPIT Chapra' },
    rollNo: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    branch: { type: String, default: 'ECE' },
    department: { type: String, default: 'Electronics & Communication Engineering' },
    year: { type: String, default: '3rd Year' },
    teamName: { type: String, default: '' },
    teamMembers: { type: [String], default: [] },
    experienceLevel: { type: String, default: 'Beginner' },
    skillLevel: { type: String, default: 'Beginner' },
    customFormResponses: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      default: 'REGISTERED',
      index: true
    },
    attendance: {
      type: String,
      default: 'PENDING',
      index: true
    },
    registeredAt: { type: String, default: () => new Date().toISOString() }
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

// Compound index for eventId and email to prevent duplicate registrations in MongoDB
EventRegistrationSchema.index({ eventId: 1, email: 1 });

export const EventRegistrationModel: Model<IEventRegistration> =
  mongoose.models.EventRegistration || mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);
export default EventRegistrationModel;
