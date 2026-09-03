import mongoose, { Schema, Model } from 'mongoose';

export interface IEvent {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description?: string;
  category: string;
  date: string;
  endDate?: string;
  time?: string;
  venue?: string;
  bannerImage: string;
  registrationOpen: boolean;
  registrationDeadline?: string;
  capacity?: number;
  registeredCount?: number;
  prerequisites?: string[];
  agenda?: Array<{ time: string; session: string; speaker?: string }>;
  speakers?: Array<{ name: string; designation: string; org: string }>;
  prizePool?: string;
  isFeatured?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const EventSchema = new Schema<IEvent>(
  {
    id: { type: String, unique: true, required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    shortDescription: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    endDate: { type: String },
    time: { type: String, default: '10:00 AM - 04:00 PM' },
    venue: { type: String, default: 'e-Yantra Robotics Lab, LNJPIT Chapra' },
    bannerImage: { type: String, default: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800' },
    registrationOpen: { type: Boolean, default: true, index: true },
    registrationDeadline: { type: String },
    capacity: { type: Number, default: 100 },
    registeredCount: { type: Number, default: 0 },
    prerequisites: { type: [String], default: [] },
    agenda: {
      type: [
        {
          time: { type: String, default: '' },
          session: { type: String, default: '' },
          speaker: { type: String }
        }
      ],
      default: []
    },
    speakers: {
      type: [
        {
          name: { type: String, default: '' },
          designation: { type: String, default: '' },
          org: { type: String, default: '' }
        }
      ],
      default: []
    },
    prizePool: { type: String },
    isFeatured: { type: Boolean, default: false, index: true }
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

export const EventModel: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
export default EventModel;
