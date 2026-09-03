import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  id: string;
  username?: string;
  email: string;
  password?: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'FACULTY' | 'COORDINATOR' | 'TECHNICAL_LEAD' | 'PROJECT_LEAD' | 'MEMBER' | 'STUDENT' | string;
  avatar?: string;
  department?: string;
  year?: string;
  studentId?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  domain?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  status?: string;
  joinedDate?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, unique: true, required: true, index: true },
    username: { type: String, trim: true, lowercase: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      default: 'MEMBER',
      index: true
    },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250' },
    department: { type: String, default: 'Electronics & Communication Engineering' },
    year: { type: String, default: '3rd Year' },
    studentId: { type: String, default: '' },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [] },
    domain: { type: String, default: 'Robotics & Automation' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        delete ret.__v;
        delete ret._id;
        delete ret.password;
        return ret;
      }
    }
  }
);

export const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default UserModel;
