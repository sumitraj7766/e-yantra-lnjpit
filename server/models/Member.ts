import mongoose, { Schema, Model } from 'mongoose';

export interface IMember {
  id: string;
  name: string;
  email: string;
  rollNo?: string;
  branch: string;
  year: string;
  domain: string;
  role: string;
  status: string;
  joinedDate: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const MemberSchema = new Schema<IMember>(
  {
    id: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    rollNo: { type: String, default: '' },
    branch: { type: String, default: 'ECE' },
    year: { type: String, default: '3rd Year' },
    domain: { type: String, default: 'Robotics' },
    role: { type: String, default: 'Member' },
    status: { type: String, default: 'Active', index: true },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    avatar: { type: String },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] }
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

export const MemberModel: Model<IMember> = mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);
export default MemberModel;
