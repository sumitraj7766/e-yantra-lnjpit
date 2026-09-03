import mongoose, { Schema, Model } from 'mongoose';

export interface IJoinApplication {
  id: string;
  name?: string;
  fullName?: string;
  email: string;
  phone: string;
  rollNo?: string;
  rollNumber?: string;
  branch?: string;
  department?: string;
  year?: string;
  cgpa?: string;
  domains?: string[];
  primaryDomain?: string;
  secondaryDomain?: string;
  technicalSkills?: string[];
  skills?: string[];
  experienceLevel?: string;
  statementOfPurpose?: string;
  whyJoin?: string;
  pastProjects?: string;
  githubUrl?: string;
  githubProfile?: string;
  linkedinUrl?: string;
  linkedinProfile?: string;
  portfolioUrl?: string;
  hoursPerWeek?: string;
  hardwareExperience?: string;
  status: string;
  reviewNotes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const JoinApplicationSchema = new Schema<IJoinApplication>(
  {
    id: { type: String, unique: true, required: true, index: true },
    name: { type: String, trim: true },
    fullName: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true },
    rollNo: { type: String, default: '' },
    rollNumber: { type: String, default: '' },
    branch: { type: String, default: 'ECE' },
    department: { type: String, default: 'ECE' },
    year: { type: String, default: '1st Year' },
    cgpa: { type: String, default: '' },
    domains: { type: [String], default: [] },
    primaryDomain: { type: String, default: 'Robotics' },
    secondaryDomain: { type: String },
    technicalSkills: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    experienceLevel: { type: String, default: 'Beginner' },
    statementOfPurpose: { type: String, default: '' },
    whyJoin: { type: String, default: '' },
    pastProjects: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    githubProfile: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    linkedinProfile: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    hoursPerWeek: { type: String, default: '10-15 hours' },
    hardwareExperience: { type: String, default: 'Intermediate' },
    status: {
      type: String,
      default: 'Pending',
      index: true
    },
    reviewNotes: { type: String, default: '' },
    submittedAt: { type: String, default: () => new Date().toISOString() },
    reviewedAt: { type: String },
    reviewedBy: { type: String }
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

export const JoinApplicationModel: Model<IJoinApplication> =
  mongoose.models.JoinApplication || mongoose.model<IJoinApplication>('JoinApplication', JoinApplicationSchema);
export default JoinApplicationModel;
