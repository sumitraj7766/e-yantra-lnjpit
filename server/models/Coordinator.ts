import mongoose, { Schema, Model } from 'mongoose';

export interface IStudentCoordinator {
  id: string;
  name: string;
  position: string;
  branch: string;
  year: string;
  photo?: string;
  email: string;
  linkedin?: string;
  github?: string;
  bio: string;
  responsibilities: string[];
  technicalSkills: string[];
  achievements: string[];
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const CoordinatorSchema = new Schema<IStudentCoordinator>(
  {
    id: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true },
    branch: { type: String, required: true },
    year: { type: String, default: '4th Year' },
    photo: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    linkedin: { type: String },
    github: { type: String },
    bio: { type: String, default: '' },
    responsibilities: { type: [String], default: [] },
    technicalSkills: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    order: { type: Number, default: 0 }
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

export const CoordinatorModel: Model<IStudentCoordinator> =
  mongoose.models.Coordinator || mongoose.model<IStudentCoordinator>('Coordinator', CoordinatorSchema);
export default CoordinatorModel;
