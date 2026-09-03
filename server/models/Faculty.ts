import mongoose, { Schema, Model } from 'mongoose';

export interface IFaculty {
  id: string;
  name: string;
  slug: string;
  designation: string;
  department: string;
  qualification: string;
  expertise: string[];
  researchInterests: string[];
  bio: string;
  email: string;
  linkedin?: string;
  photo: string;
  publications: string[];
  mentorshipAreas: string[];
  isPublished: boolean;
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    id: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    qualification: { type: String, default: '' },
    expertise: { type: [String], default: [] },
    researchInterests: { type: [String], default: [] },
    bio: { type: String, default: '' },
    email: { type: String, required: true, lowercase: true, trim: true },
    linkedin: { type: String, default: '' },
    photo: { type: String, required: true },
    publications: { type: [String], default: [] },
    mentorshipAreas: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true, index: true },
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

export const FacultyModel: Model<IFaculty> = mongoose.models.Faculty || mongoose.model<IFaculty>('Faculty', FacultySchema);
export default FacultyModel;
