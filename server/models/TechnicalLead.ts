import mongoose, { Schema, Model } from 'mongoose';

export interface ITechnicalLead {
  id: string;
  name: string;
  domain: string;
  domainBadge?: string;
  position: string;
  branch: string;
  year: string;
  photo?: string;
  email: string;
  linkedin?: string;
  github?: string;
  bio: string;
  technicalSkills: string[];
  projectsLed: string[];
  order: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const TechnicalLeadSchema = new Schema<ITechnicalLead>(
  {
    id: { type: String, unique: true, required: true, index: true },
    name: { type: String, required: true, trim: true },
    domain: { type: String, required: true, index: true },
    domainBadge: { type: String, default: '' },
    position: { type: String, required: true },
    branch: { type: String, required: true },
    year: { type: String, default: '3rd Year' },
    photo: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    linkedin: { type: String },
    github: { type: String },
    bio: { type: String, default: '' },
    technicalSkills: { type: [String], default: [] },
    projectsLed: { type: [String], default: [] },
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

export const TechnicalLeadModel: Model<ITechnicalLead> =
  mongoose.models.TechnicalLead || mongoose.model<ITechnicalLead>('TechnicalLead', TechnicalLeadSchema);
export default TechnicalLeadModel;
